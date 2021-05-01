#!/bin/bash

set -e

start=$(pwd)

cd ../scratch-gui
rm -r translations
npm run build

cd $start
rm -r in
mkdir -p in
cp -r ../scratch-gui/translations/messages/ in
cp ../scratch-vm/src/extensions/tw/index.js in/tw.js

echo DONE
read
