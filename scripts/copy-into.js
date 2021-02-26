const fs = require('fs');

fs.copyFileSync('out/gui.json', '../scratch-gui/src/lib/tw-translations/translations.json');
fs.copyFileSync('out/addons.json', '../scratch-gui/src/addons/settings/l10n/translations.json');
fs.copyFileSync('out/desktop.json', '../turbowarp-desktop/src/l10n/translations.json');

const oldSplash = fs.readFileSync('../scratch-gui/src/playground/index.ejs', 'utf-8').match(/JSON\.parse\(\'({.+})\'\)\;/)[1];
const newSplash = fs.readFileSync('out/splash.json', 'utf-8').replace(/'/g, '\\\'');
if (oldSplash !== newSplash) {
  console.warn('Splash outdated');
}
