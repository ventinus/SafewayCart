import fetch from "node-fetch";
import { domainRoot, headers } from "@/lib/constants";

const URLS = {
  cartService: ({ storeId, zipCode }) =>
    `${domainRoot}/abs/pub/erums/cartservice/api/v2/cart/items?${new URLSearchParams(
      {
        storeId,
        zipCode,
        serviceType: "Dug",
      }
    )}`,
};

export const addItemToCart = async ({
  cookie,
  jwtToken,
  itemId,
  quantity,
  subKey,
  storeId,
  zipCode,
}) => {
  console.log(jwtToken, headers, cookie);
  const response = await fetch(URLS.cartService({ storeId, zipCode }), {
    method: "POST",
    headers: {
      ...headers,
      cookie,
      Authorization: jwtToken,
      "ocp-apim-subscription-key": subKey,
    },
    body: JSON.stringify({ cartItemsList: [{ itemId, qty: quantity }] }),
  });
  console.log(response);
  if (!response.ok) {
    console.log("didnt work!");
  }
};
