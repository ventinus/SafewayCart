# Safeway Cart Skill

## So what?

I'm tired of adding items to a list with Alexa and then either manually adding those items to a shopping cart (specifically a Safeway shopping cart),
or going to the store and doing the shopping like a 20th century bloke.

## What's this

The goal is to have an Alexa skill that can add items automatically to your cart based on your previous purchase history. The reason for this is to 
limit the number of possible items that would come from a full search because navigating these things through voice is still a PITA.

## Setup

I haven't gone through the CDK configuration I normally would (will invest in it if it seems worth it) so creating resources is just through the AWS console.

1. Create a set of secrets in AWS Secrets Manager to contain `username` and `password` values. The name of mine is `SafewayCreds`
1. Create an S3 bucket to store the lambda runtime code and browser screenshots. I named mine `safeway-lambdas`
1. Create a lambda to run browser based actions (i.e. logging a user in to get an Authorization token). Make sure to set the Runtime to `Node 14.x` due 
to compatibility issues with `chrome-aws-lambda`. I named mine `SafewayBrowser`
  1. Modify the execution role IAM policy of the Lambda to have `putObject` access to the previously created bucket for all objects (or a specific path). This will allow the 
  lambda to store screenshots in the event something fails during the workflow.
  1. Add the lambda environment key `Bucket` with the name of the new S3 bucket (i.e. `safeway-lambdas`)
  1. Update Memory to 1024 MB
  1. Update Timeout to 30 sec (I currently experience duration to be around 20 seconds)
1. Create a lambda to be the Alexa skill runtime lambda. This is what is run when you invoke your skill through Alexa. I named mine `SafewayCartSkill`

## Developer workflow

1. install dependencies `npm install`
1. run tests `npm test`
1. build `npm run build`
1. deploy `npm run deploy`
  1. this will build the lambda code with webpack, make sure external dependencies are installed in the appropriate lambda directory, create zip files 
  for the lambdas
  1. leveraging the AWS CLI to deploy the resources to your account which includes the zip files for your lambda code and updates the lambda to use
  the most recent code

## Needed Improvements
- upgrade puppeteer lambda nodejs version to latest (v18)
  - when on v18+, upgrade `aws-sdk` to `@aws-sdk` v3