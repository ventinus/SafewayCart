import { fromIni } from "@aws-sdk/credential-providers";

import { handler } from "@/browserLambda";
import { getSecrets } from "@/lib/secrets";

let credentials;

describe("browserLambda", () => {
  beforeAll(async () => {
    const tokens = await fromIni({ profile: "personal" })();
    credentials = await getSecrets(tokens);
  });

  it("should handle getting a jwt token", async () => {
    const { statusCode, body } = await handler({
      action: "getJwtToken",
      params: credentials,
    });
    expect(statusCode).toBe(200);
    expect(body).toContain("Bearer ey");
    expect(body.length > 300).toBe(true);
  }, 20000);
});
