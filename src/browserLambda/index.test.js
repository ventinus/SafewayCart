import { handler } from "@/browserLambda";

jest.mock("@/lib/secrets", () => ({
  getSecrets: jest.fn().mockReturnValue({ username: "foo", password: "bar" }),
  updateJwtToken: jest.fn(),
}));

describe("browserLambda", () => {
  it("should handle getting a jwt token", async () => {
    const { statusCode, body } = await handler({
      action: "getJwtToken",
    });
    expect(statusCode).toBe(200);
    expect(body).toContain("Bearer ey");
    expect(body.length > 300).toBe(true);
  }, 30000);
});
