import AWS from "aws-sdk";
import fetch from "node-fetch";

import { parseCookies } from "@/skillLambda/utils";

const HEADERS = {
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.5",
  "Content-Type": "application/json",
};

const DOMAIN = "https://www.safeway.com";

const PURCHASE_PAGE_SIZE = 50; // max allowed by safeway api

const getCookie = async (credentials) => {
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

const fetchJwtToken = async (credentials) => {
  const { BrowserLambdaArn } = process.env;
  const browserLambdaName = BrowserLambdaArn.split(":").reverse()[0];
  const lambdaClient = new AWS.Lambda();
  const params = {
    FunctionName: browserLambdaName,
    InvocationType: "RequestResponse",
    Payload: JSON.stringify({ action: "getJwtToken", params: credentials }),
  };
  const response = await lambdaClient.invoke(params).promise();
  const { statusCode, body } = JSON.parse(response.Payload);
  if (statusCode !== 200) {
    throw new Error(`fetchJwtToken failed with status ${statusCode}`);
  }
  return body;
};

// also available: rewaredsProgramId (not currently used)
export const api = async ({
  subKey,
  cartSubKey,
  houseId,
  zipCode,
  locationId: storeId,
  ...creds
}) => {
  const PATHS = {
    purchaseHistory: ({ pageNo }) =>
      `${DOMAIN}/abs/pub/xapi/purchases/purchasehistory/products/${houseId}?${new URLSearchParams(
        {
          pageNo,
          storeId,
          pageSize: PURCHASE_PAGE_SIZE,
          banner: "safeway",
        }
      )}`,
    smartHistory: ({ pageNo }) =>
      `${DOMAIN}/abs/pub/xapi/purchases/purchasehistory/smartbasket/${houseId}?${new URLSearchParams(
        {
          pageNo,
          storeId,
          pageSize: PURCHASE_PAGE_SIZE,
          channel: "pickup",
          availabilityCheck: true,
        }
      )}`,
    addToCart: `${DOMAIN}/abs/pub/erums/cartservice/api/v2/cart/items?${new URLSearchParams(
      {
        storeId,
        zipCode,
        serviceType: "Dug",
      }
    )}`,
  };

  const [cookie, jwtToken] = await Promise.all([
    getCookie(creds),
    fetchJwtToken(creds),
  ]);
  console.log(cookie, jwtToken, subKey, cartSubKey, houseId, zipCode, storeId);

  const request = async (
    url,
    { body, method = "GET", headers = {}, subscriptionKey = subKey } = {}
  ) => {
    const params = {
      method,
      headers: {
        ...HEADERS,
        ...headers,
        cookie,
        Authorization: jwtToken,
        "ocp-apim-subscription-key": subscriptionKey,
      },
    };

    if (body && method === "POST") params.body = JSON.stringify(body);

    console.log(
      `Making request to ${url} with params ${JSON.stringify(params)}`
    );
    const response = await fetch(url, params);
    if (!response.ok) {
      throw new Error(
        `Error calling ${method} on ${url}, status: ${response.status}`
      );
    }
    return await response.json();
  };

  const getPurchaseHistory = async ({ pageNo = 0 } = {}) => {
    const { purchases, purchasesCount } = await request(
      PATHS.purchaseHistory({ pageNo })
    );

    // get the next page of results
    if (purchasesCount === PURCHASE_PAGE_SIZE) {
      const morePurchases = await getPurchaseHistory({
        pageNo: pageNo + 1,
      });
      purchases.push(...morePurchases);
    }

    return purchases;
  };

  const getSmartHistory = async ({ pageNo = 0 } = {}) => {
    const { purchases, purchasesCount } = await request(
      PATHS.purchaseHistory({ pageNo })
    );

    // get the next page of results
    if (purchasesCount === PURCHASE_PAGE_SIZE) {
      const morePurchases = await getSmartHistory({
        pageNo: pageNo + 1,
      });
      purchases.push(...morePurchases);
    }

    return purchases;
  };

  const addItemToCart = ({ itemId, quantity }) => {
    return request(PATHS.addToCart, {
      subscriptionKey: cartSubKey,
      method: "POST",
      body: { cartItemsList: [{ itemId, qty: quantity }] },
    });
  };

  return {
    getPurchaseHistory,
    getSmartHistory,
    addItemToCart,
  };
};
