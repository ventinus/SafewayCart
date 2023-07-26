import { browserWrapper } from "./browserWrapper";
import { getSecrets, updateJwtToken } from "@/lib/secrets";

const ACTIONS = {
  getJwtToken: async ({ username, password }) => {
    const browser = await browserWrapper;
    await browser.page.goto("https://safeway.com");

    // try {
    //   await browser.click("button.unsupported-browser-button", {
    //     maxAttempts: 3,
    //   });
    // } catch (_) {
    //   /* ok if button isn't there */
    // }

    await browser.click('a[title="Your profile"]');
    await browser.click("#sign-in-modal-link");

    console.log("entering email");
    await browser.type("#label-email", username);
    console.log("entering password");
    await browser.type("#label-password", password);
    console.log("clicking signin");
    await browser.click("#btnSignIn");

    const tokenCookie = await browser.waitFor(async () => {
      return (await browser.page.cookies()).find(
        (item) => item.name === "SWY_SHARED_SESSION"
      );
    });
    const token = JSON.parse(decodeURIComponent(tokenCookie.value)).accessToken;

    await Promise.all([browser.close(), updateJwtToken(token)]);
  },
};

export const handler = async (event) => {
  const timeoutId = setTimeout(() => {
    browserWrapper.then(async (browser) => {
      await browser.logDom();
      await browser.screenshot({ filename: `${event.action}-timeout` });
    });
  }, 28000);
  const action = ACTIONS[event.action];

  if (!action) {
    clearTimeout(timeoutId);
    return {
      statusCode: 404,
      body: `Action ${event.action} does not exist`,
    };
  }

  const { username, password } = await getSecrets();

  const response = await action({ username, password });

  clearTimeout(timeoutId);
  return {
    statusCode: 200,
    body: response,
  };
};
