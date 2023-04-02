// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
// import {
//   SecretsManagerClient,
//   GetSecretValueCommand,
// } from "@aws-sdk/client-secrets-manager";
import AWS from "aws-sdk";

const SecretId = "SafewayCreds";

/**
 *
 * @param {*} awsTokens
 * @returns { username, password, locationId, zipCode, subKey, cartSubKey, rewardsProgramId }
 */
export const getSecrets = async (awsTokens) => {
  const client = new AWS.SecretsManager({
    apiVersion: "2017-10-17",
    region: "us-west-2",
    credentials: awsTokens,
  });
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

  return JSON.parse(response.SecretString);
};
