import fetch from "node-fetch";
import { Browser } from "@/lib/Browser";

const parseCookies = (response) => {
  const raw = response.headers.raw()["set-cookie"];
  return raw
    .map((entry) => {
      const parts = entry.split(";");
      return parts[0];
    })
    .join(";");
};

export const getJwtToken = async ({ username, password }) => {
  const browser = await new Browser().init();

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
};

export const getCookie = async (credentials) => {
  const response = await fetch("https://albertsons.okta.com/api/v1/authn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const cookie = parseCookies(response);
  const { status } = await response.json();

  if (status !== "SUCCESS") {
    throw new Error(`Error logging in with status: ${status}`);
  }

  return cookie;
};
