import fetch from "node-fetch";
import { domainRoot, headers } from "@/lib/constants";

const pageSize = 50; // max allowed by safeway api

const URLS = {
  purchaseHistory: ({ pageNo, storeId, houseId }) =>
    `${domainRoot}/abs/pub/xapi/purchases/purchasehistory/products/${houseId}?${new URLSearchParams(
      {
        pageNo,
        pageSize,
        storeId,
        banner: "safeway",
      }
    )}`,
  smartHistory: ({ pageNo, storeId, houseId }) =>
    `${domainRoot}/abs/pub/xapi/purchases/purchasehistory/smartbasket/${houseId}?${new URLSearchParams(
      {
        pageNo,
        pageSize,
        storeId,
        channel: "pickup",
        availabilityCheck: true,
      }
    )}`,
};

const purchaseApi =
  (path) =>
  async ({ cookie, pageNo = 0, storeId, subKey, houseId }) => {
    const response = await fetch(path({ pageNo, storeId, houseId }), {
      headers: {
        ...headers,
        cookie,
        "ocp-apim-subscription-key": subKey,
      },
    });
    const { purchases, purchasesCount } = await response.json();

    if (purchasesCount === pageSize) {
      const morePurchases = await getPurchaseHistory({
        cookie,
        pageNo: pageNo + 1,
      });
      purchases.push(...morePurchases);
    }

    return purchases;
  };

export const getPurchaseHistory = purchaseApi(URLS.purchaseHistory);

export const getSmartHistory = purchaseApi(URLS.smartHistory);
