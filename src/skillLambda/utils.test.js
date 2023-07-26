import { findItem } from "@/skillLambda/utils";

describe("utils", () => {
  describe("findItem", () => {
    it("should locate an item in the provided data", () => {
      expect(findItem('bananas')).toEqual({})
    });
  });

  describe("parseCookies", () => {
    it.todo(
      "should take the browser cookies from a response and convert it to a string"
    );
  });
});
