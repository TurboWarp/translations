#!/bin/bash

set -e

cp out/gui.json ../scratch-gui/src/lib/tw-translations/translations.json

[[ "$(cat ../scratch-gui/src/playground/index.ejs)" =~ JSON\.parse\(\'{.+}\'\)\; ]]
old="${BASH_REMATCH[0]}"
new="JSON.parse('$(cat out/splash.json)');"
if [[ "$old" != "$new" ]]; then
  echo Splash outdated.
fi

echo DONE
read
