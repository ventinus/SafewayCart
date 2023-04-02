#!/bin/sh

LAMBDA_CODE[0]="browserLambda"
LAMBDA_NAME[0]="SafewayBrowser"

LAMBDA_CODE[1]="skillLambda"
LAMBDA_NAME[1]="SafewayCartSkill"

BUCKET="safeway-lambdas"
PROFILE="personal"
LENGTH=${#LAMBDA_CODE[@]}

# build lambda code bundles with dependencies
npm-run-all clean build
node bin/copyDependencies

deploy () {
  CODE=${LAMBDA_CODE[$1]}
  NAME=${LAMBDA_NAME[$1]}
  echo "Starting $CODE"

  (cd dist/$CODE && npm i && zip -r "$OLDPWD/dist/$CODE.zip" .)
  aws s3 cp dist/$CODE.zip s3://$BUCKET --profile $PROFILE
  aws lambda update-function-code --function-name $NAME --s3-bucket $BUCKET --s3-key $CODE.zip --profile $PROFILE
}

for (( i=0; i<$LENGTH; i++)) do deploy "$i" & done; wait

echo "Deployment successful"