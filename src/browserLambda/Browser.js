import AWS from "aws-sdk";
import chromium from "chrome-aws-lambda";

export class Browser {
  constructor() {}

  async init() {
    this.browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ["--disable-extensions"],
      waitUntil: "load",
    });

    this.page = await this.browser.newPage();

    return this;
  }

  async click(selector, { attempt = 0, delay = 100, maxAttempts = 5 } = {}) {
    if (!this.page) throw new Error("Must run Browser.init");
    try {
      await this.page.click(selector);
    } catch (err) {
      if (attempt >= maxAttempts) {
        console.log("max attempts exceeded clicking element", selector);
        await this.screenshot({ filename: "click-failure" });
        throw err;
      }
      await this.wait(delay);
      await this.click(selector, { attempt: attempt + 1, delay, maxAttempts });
    }
  }

  async type(selector, text) {
    if (!this.page) throw new Error("Must run Browser.init");
    try {
      const input = await this.page.waitForSelector(selector, {
        visible: true,
      });
      await input.evaluate((node, value) => (node.value = value), text);
    } catch (err) {
      console.log(`could not find input to type ${text}`);
      console.error(err);
      await this.screenshot({ filename: "type-failure" });
    }
  }

  wait(ms = 250) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async waitFor(
    conditionFn,
    { attempt = 0, delay = 100, maxAttempts = 5 } = {}
  ) {
    const result = await conditionFn();
    if (!result) {
      await this.wait(delay);
      return this.waitFor(conditionFn, { attempt, delay, maxAttempts });
    }
    return result;
  }

  /**
   * Takes a puppeteer screenshot and saves it to s3
   *
   * @param  {String}  options.filename The final part of the filename key
   *                                    (in case of development)
   * @return {String}                   The full S3 key the file was saved at
   */
  async screenshot({ filename, region = "us-west-2" }) {
    const s3 = new AWS.S3({ region });
    const screenshot = await this.page.screenshot({ fullPage: true });

    const Key = `screenshots/${filename}.png`;
    await s3
      .putObject({
        Key,
        Bucket: process.env.Bucket,
        Body: screenshot,
      })
      .promise();

    console.log(
      `Screenshot https://console.aws.amazon.com/s3/object/${process.env.Bucket}/${Key} has been stored`
    );
  }

  async close() {
    await this.page.close();
    await this.browser.close();
  }
}
