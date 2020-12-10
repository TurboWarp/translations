#!/bin/bash

set -e

start=$(pwd)

cd ../scratch-gui
npm run build

cd $start
rm -r in
mkdir -p in
cp -r ../scratch-gui/translations/messages/src/ in

node scripts/load-gui.js
