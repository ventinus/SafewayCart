import { getPurchaseHistory } from "@/lib/history";
import { addItemToCart } from "@/lib/addItemToCart";
import { findItem } from "@/lib/findItem";
import { getSecrets } from "./secrets";
import { getCookie, getJwtToken } from "./login";

// export const handleAddToCart = async ({ name, quantity = 1 }) => {};

(async ({ name, quantity = 1 }) => {
  const {
    username,
    password,
    zipCode,
    subKey,
    cartSubKey,
    houseId,
    locationId: storeId,
  } = await getSecrets();
  const cookie = await getCookie({ username, password });
  const jwtToken = await getJwtToken({ username, password });

  // check if item is already in the cart

  // from the params, find the itemId either from smartBasket, all previously bought items, or general search
  const purchases = await getPurchaseHistory({ cookie, storeId, subKey, houseId });
  const item = findItem(purchases, { name });

  await addItemToCart({
    cookie,
    jwtToken,
    quantity,
    zipCode,
    storeId,
    itemId: item.id,
    subKey: cartSubKey,
  });
})({ name: "Bananas", quantity: 10 });
