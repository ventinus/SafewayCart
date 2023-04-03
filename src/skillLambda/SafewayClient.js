import { getSecrets } from "@/lib/secrets";
import { api } from "@/skillLambda/api";
import { findItem } from "@/skillLambda/utils";

export class SafewayClient {
  constructor() {
    this.api = undefined;
  }

  async init() {
    console.log("calling init");
    if (!this.api) {
      this.api = await api(await getSecrets());
    }

    return this;
  }

  async addItemToCart({ name, quantity = 1 }) {
    console.log(`adding ${quantity} ${name} to cart`);
    const purchases = await this.api.getPurchaseHistory();
    const item = findItem(purchases, { name });

    if (!item) {
      throw new Error(
        `could not find item ${name} amidst previous purchases ${JSON.stringify(
          purchases,
          null,
          2
        )}`
      );
    }

    return this.api.addItemToCart({ itemId: item.id, quantity });
  }
}
