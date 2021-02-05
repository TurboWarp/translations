#!/bin/bash

set -e

cp out/gui.json ../scratch-gui/src/lib/tw-translations/translations.json
cp out/addons.json ../scratch-gui/src/addons/settings/l10n/translations.json

[[ "$(cat ../scratch-gui/src/playground/index.ejs)" =~ JSON\.parse\(\'{.+}\'\)\; ]]
old="${BASH_REMATCH[0]}"
new=$(cat out/splash.json)
new=${new/\'/\\\'}
new="JSON.parse('$new');"
if [[ "$old" != "$new" ]]; then
  echo Splash outdated.
fi

echo DONE
read
