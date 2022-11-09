#!/bin/bash
mkdir -p build/Release

cd ./src/lib/email-validator
npm install
npx node-gyp configure && npx node-gyp build
cp ./build/Release/emailValidator.node ../../../build/Release/emailValidator.node

cd ../password-validator
npm install
npx node-gyp configure && npx node-gyp build
cp ./build/Release/passwordValidator.node ../../../build/Release/passwordValidator.node


cd ../logger
npm install
npx node-gyp configure && npx node-gyp build
cp ./build/Release/log.node ../../../build/Release/log.node

