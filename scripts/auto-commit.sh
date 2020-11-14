#!/bin/bash

set -e

node scripts/build-for-scratch-gui.js
cp out/translations.json ../scratch-gui/src/lib/tw-translations/translations.json
