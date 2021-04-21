const fs = require('fs');

fs.copyFileSync('out/gui.json', '../scratch-gui/src/lib/tw-translations/translations.json');
fs.copyFileSync('out/addons.json', '../scratch-gui/src/addons/settings/l10n/translations.json');
fs.copyFileSync('out/desktop.json', '../turbowarp-desktop/src/l10n/translations.json');
