const path = require("path");

module.exports = {
  target: "node",
  externals: {
    "chrome-aws-lambda": "chrome-aws-lambda",
    "aws-sdk": "aws-sdk",
  },
  entry: {
    browserLambda: path.resolve(__dirname, "./src/browserLambda/index.js"),
    skillLambda: path.resolve(__dirname, "./src/skillLambda/index.js"),
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name]/index.js",
    libraryTarget: "commonjs2",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
  mode: "development",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
    extensions: [".js"],
  },
};
