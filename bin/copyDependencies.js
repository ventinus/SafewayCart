const path = require("path");
const fs = require("fs");

const cwd = process.cwd();
const { name, version, dependencies } = require(`${cwd}/package.json`);
const package = { name, version, dependencies };

const destinations = [
  { name: "browserLambda", deny: ["ask-sdk-core"] },
  { name: "skillLambda", deny: ["chrome-aws-lambda", "puppeteer-core"] },
];

destinations.forEach(({ name, deny }) => {
  const finalPackage = { ...package };
  finalPackage.name = `${finalPackage.name}-${name}`
  deny.forEach((key) => delete finalPackage.dependencies[key]);
  fs.writeFile(
    path.resolve(cwd, "dist", name, "package.json"),
    JSON.stringify(finalPackage),
    (err) => {
      console.log(err || `${name} created successfully`);
    }
  );
});
