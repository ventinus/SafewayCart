import { fromIni } from "@aws-sdk/credential-providers";
// import { server } from "@/test-utils/mocks/server.js";
// import { getSecrets } from "@/lib/secrets";

// jest.mock("aws-sdk", () => ({
//   S3: jest.fn(() => ({
//     putObject: (params) => ({
//       promise: () => "done",
//     }),
//   })),
//   SecretsManager: jest.fn(() => ({
//     getSecretValue: (params) => ({
//       promise: () => ({
//         SecretString: JSON.stringify(require("./secrets.json")),
//       }),
//     }),
//   })),
//   Lambda: jest.fn(() => ({
//     invoke: (params) => ({
//       promise: () => ({
//         Payload: JSON.stringify({ statusCode: 200, body: "jwt token" }),
//       }),
//     }),
//   })),
// }));

// process.env.BrowserLambdaArn = "arn:FunctionName";

beforeAll(async () => {
  global.awsCredentials = await fromIni({ profile: "personal" })();

  // Establish API mocking before all tests.
  // server.listen();
});

// // Reset any request handlers that we may add during the tests,
// // so they don't affect other tests.
// afterEach(() => server.resetHandlers());

// // Clean up after the tests are finished.
// afterAll(server.close);
