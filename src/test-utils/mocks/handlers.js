import { rest } from "msw";

export const handlers = [
  rest.post(
    "https://albertsons.okta.com/api/v1/authn",
    async (req, res, ctx) => {
      console.log("auth n request", req, res);
      return null;
      // return res(ctx.status(403), ctx.json({ errorMessage: "whopp" }));
    }
  ),
  rest.get(
    "https://www.safeway.com/abs/pub/xapi/purchases/purchasehistory/products/:houseId",
    (req, res, ctx) => {
      // TODO: return different sets of purchases based on req.params.houseId
      return res(
        ctx.status(200),
        ctx.json({ purchases: [], purchaseCount: 0 })
      );
    }
  ),
  rest.get(
    "https://www.safeway.com/abs/pub/xapi/purchases/purchasehistory/smartbasket/:houseId",
    (req, res, ctx) => {
      // TODO: return different sets of purchases based on req.params.houseId
      return res(
        ctx.status(200),
        ctx.json({ purchases: [], purchaseCount: 0 })
      );
    }
  ),
  rest.post(
    "https://www.safeway.com/abs/pub/erums/cartservice/api/v2/cart/items",
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ success: true }));
    }
  ),
];
