import { Browser } from "./Browser";

let browser = new Browser().init();

const ACTIONS = {
  getJwtToken: async ({ username, password }) => {
    browser = await browser;
    await browser.page.goto("https://safeway.com");

    try {
      await browser.click("button.unsupported-browser-button", {
        maxAttempts: 3,
      });
    } catch (_) {
      /* ok if button isn't there */
    }

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

    await browser.close();

    return `Bearer ${token}`;
  },
};

export const handler = async (event) => {
  const action = ACTIONS[event.action];

  if (!action) {
    return {
      statusCode: 404,
      body: `Action ${event.action} does not exist`,
    };
  }

  const response = await action(event.params);

  return {
    statusCode: 200,
    body: response,
  };
};
