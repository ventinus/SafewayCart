export const handler = async (event) => {
  console.log("hello!", JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    body: "response",
  };
};
