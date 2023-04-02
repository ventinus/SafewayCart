import { getJwtToken } from "@/lib/login";

const ACTIONS = { getJwtToken };

export const handler = async (event) => {
  const action = ACTIONS[event.action];

  if (!action) {
    return {
      statusCode: 404,
      body: `Action ${event.action} does not exist`,
    };
  }

  const response = await action(event.params);

  return {
    statusCode: 200,
    body: response,
  };
};
