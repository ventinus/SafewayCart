import { safewayClient } from "./SafewayClient";

describe("safewayClient", () => {
  it("should handle adding an item to the cart", async () => {
    const client = await safewayClient;
    const response = await client.addItemToCart({
      name: "bananas",
      quantity: 10,
    });
    expect(response);
  });

  it.todo("should throw if it cannot find the item");
});
