import AWS from "aws-sdk";
import chromium from "chrome-aws-lambda";
// import userAgent from "user-agents";
import { addExtra } from "puppeteer-extra";

import StealthPlugin from "puppeteer-extra-plugin-stealth";
// import ChromeAppPlugin from "puppeteer-extra-plugin-stealth/evasions/chrome.app";
// import ChromeCsiPlugin from "puppeteer-extra-plugin-stealth/evasions/chrome.csi";
// import ChromeLoadTimes from "puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes";
// import ChromeRuntimePlugin from "puppeteer-extra-plugin-stealth/evasions/chrome.runtime";
// import IFrameContentWindowPlugin from "puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow";
// import MediaCodecsPlugin from "puppeteer-extra-plugin-stealth/evasions/media.codecs";
// import NavigatorLanguagesPlugin from "puppeteer-extra-plugin-stealth/evasions/navigator.languages";
// import NavigatorPermissionsPlugin from "puppeteer-extra-plugin-stealth/evasions/navigator.permissions";
// import NavigatorPlugins from "puppeteer-extra-plugin-stealth/evasions/navigator.plugins";
// import NavigatorVendor from "puppeteer-extra-plugin-stealth/evasions/navigator.vendor";
// import NavigatorWebdriver from "puppeteer-extra-plugin-stealth/evasions/navigator.webdriver";
// import SourceUrlPlugin from "puppeteer-extra-plugin-stealth/evasions/sourceurl";
// import UserAgentOverridePlugin from "puppeteer-extra-plugin-stealth/evasions/user-agent-override";
// import WebglVendorPlugin from "puppeteer-extra-plugin-stealth/evasions/webgl.vendor";
// import WindowOuterDimensionsPlugin from "puppeteer-extra-plugin-stealth/evasions/window.outerdimensions";

const puppeteer = addExtra(chromium.puppeteer);
puppeteer.use(StealthPlugin());
// const plugins = [
//   StealthPlugin(),
//   ChromeAppPlugin(),
//   ChromeCsiPlugin(),
//   ChromeLoadTimes(),
//   ChromeRuntimePlugin(),
//   IFrameContentWindowPlugin(),
//   MediaCodecsPlugin(),
//   NavigatorLanguagesPlugin(),
//   NavigatorPermissionsPlugin(),
//   NavigatorPlugins(),
//   NavigatorVendor(),
//   NavigatorWebdriver(),
//   SourceUrlPlugin(),
//   UserAgentOverridePlugin(),
//   WebglVendorPlugin(),
//   WindowOuterDimensionsPlugin(),
// ];

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:102.0) Gecko/20100101 Firefox/102.0";

export const browserWrapper = (async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
    ignoreDefaultArgs: ["--disable-extensions"],
    waitUntil: "load",
  });

  // for (const plugin of plugins) {
  //   await plugin.onBrowser(browser);
  // }

  const page = await browser.newPage();
  // for (const plugin of plugins) {
  //   await plugin.onPageCreated(page);
  // }
  // const userAgentString = userAgent.random().toString();
  // console.log("userAgentString: ", userAgentString);
  await page.setViewport({
    width: 1920 + Math.floor(Math.random() * 100),
    height: 3000 + Math.floor(Math.random() * 100),
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false,
  });

  await page.setUserAgent(USER_AGENT);
  await page.setJavaScriptEnabled(true);
  await page.setDefaultNavigationTimeout(0);

  //Skip images/styles/fonts loading for performance
  // await page.setRequestInterception(true);
  // page.on("request", (req) => {
  //   if (
  //     req.resourceType() == "stylesheet" ||
  //     req.resourceType() == "font" ||
  //     req.resourceType() == "image"
  //   ) {
  //     req.abort();
  //   } else {
  //     req.continue();
  //   }
  // });

  // await page.evaluateOnNewDocument(() => {
  //   // Pass webdriver check
  //   Object.defineProperty(navigator, "webdriver", {
  //     get: () => false,
  //   });
  // });

  // await page.evaluateOnNewDocument(() => {
  //   // Pass chrome check
  //   window.chrome = {
  //     runtime: {},
  //     // etc.
  //   };
  // });

  // await page.evaluateOnNewDocument(() => {
  //   //Pass notifications check
  //   const originalQuery = window.navigator.permissions.query;
  //   return (window.navigator.permissions.query = (parameters) =>
  //     parameters.name === "notifications"
  //       ? Promise.resolve({ state: Notification.permission })
  //       : originalQuery(parameters));
  // });

  // await page.evaluateOnNewDocument(() => {
  //   // Overwrite the `plugins` property to use a custom getter.
  //   Object.defineProperty(navigator, "plugins", {
  //     // This just needs to have `length > 0` for the current test,
  //     // but we could mock the plugins too if necessary.
  //     get: () => [1, 2, 3, 4, 5],
  //   });
  // });

  // await page.evaluateOnNewDocument(() => {
  //   // Overwrite the `languages` property to use a custom getter.
  //   Object.defineProperty(navigator, "languages", {
  //     get: () => ["en-US", "en"],
  //   });
  // });

  const click = async (
    selector,
    { attempt = 0, delay = 100, maxAttempts = 5 } = {}
  ) => {
    try {
      await page.waitForSelector(selector);
      await page.evaluate(
        (sel) => document.querySelector(sel).click(),
        selector
      );
    } catch (err) {
      if (attempt >= maxAttempts) {
        console.log("max attempts exceeded clicking element", selector);
        await screenshot({ filename: "click-failure" });
        await logDom();
        throw err;
      }
      await wait(delay);
      await click(selector, { attempt: attempt + 1, delay, maxAttempts });
    }
  };

  const type = async (selector, text) => {
    try {
      const input = await page.waitForSelector(selector, {
        visible: true,
      });
      await input.evaluate((node, value) => (node.value = value), text);
    } catch (err) {
      console.log(`could not find input to type ${text}`);
      console.error(err);
      await screenshot({ filename: "type-failure" });
    }
  };

  const wait = (ms = 250) => {
    return new Promise((res) => setTimeout(res, ms));
  };

  const waitFor = async (
    conditionFn,
    { attempt = 0, delay = 100, maxAttempts = 5 } = {}
  ) => {
    const result = await conditionFn();
    if (!result) {
      await wait(delay);
      return waitFor(conditionFn, { attempt, delay, maxAttempts });
    }
    return result;
  };

  /**
   * Takes a puppeteer screenshot and saves it to s3
   *
   * @param  {String}  options.filename The final part of the filename key
   *                                    (in case of development)
   * @return {String}                   The full S3 key the file was saved at
   */
  const screenshot = async ({ filename, region = "us-west-2" }) => {
    if (process.env.NODE_ENV === "test") return;

    const s3 = new AWS.S3({ region });
    const screenshot = await page.screenshot({ fullPage: true });

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
  };

  const logDom = async () => {
    const html = await page.evaluate(() => document.body.outerHTML);
    console.log("HTML string:\n", html);
  };

  const close = async () => {
    await page.close();
    await browser.close();
  };

  return { page, click, type, wait, waitFor, screenshot, close, logDom };
})();
