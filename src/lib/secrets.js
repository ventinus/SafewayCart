// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
// import {
//   SecretsManagerClient,
//   GetSecretValueCommand,
// } from "@aws-sdk/client-secrets-manager";

import AWS from "aws-sdk";

const SecretId = "SafewayCreds";
const client = new AWS.SecretsManager({
  apiVersion: "2017-10-17",
  region: "us-west-2",
});

let secrets;
/**
 *
 * @returns { username, password, locationId, zipCode, subKey, cartSubKey, rewardsProgramId, jwtToken }
 */
export const getSecrets = async () => {
  if (secrets) {
    console.log("returning cached secrets");
    return secrets;
  }

  // const client = new SecretsManagerClient({
  //   region: "us-west-2",
  //   credentials: awsTokens,
  // });

  const response = await client.getSecretValue({ SecretId }).promise();

  // let response;
  // try {
  //   response = await client.send(
  //     new GetSecretValueCommand({ SecretId })
  //   );
  // } catch (err) {
  //   // For a list of exceptions thrown, see
  //   // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  //   throw error;
  // }

  secrets = JSON.parse(response.SecretString);
  return secrets;
};

export const updateJwtToken = async (jwtToken) => {
  secrets = { ...(await getSecrets()), jwtToken: `Bearer ${jwtToken}` };
  await client
    .updateSecret({
      SecretId,
      SecretString: JSON.stringify(secrets),
    })
    .promise();
  return secrets;
};
