const fs = require('fs');
const pathUtil = require('path');

const Papa = require('papaparse');
const {
  translationsDirectory,
  outputDirectory
} = require('./common');

const readTranslations = (path) => {
  const result = {};
  const content = fs.readFileSync(path, { encoding: 'utf8' });
  const parsed = Papa.parse(content);
  for (const [id, context, message] of parsed.data) {
    result[id] = message;
  }
  return result;
};

const gui = {
  '__README__': 'Imported from https://github.com/TurboWarp/translations -- DO NOT EDIT BY HAND'
};

const splash = {

};

const languages = fs.readdirSync(translationsDirectory);
for (const language of languages) {
  console.log(`Processing ${language}`);

  if (language !== 'en') {
    const guiPath = pathUtil.join(translationsDirectory, language, 'gui.csv');
    if (fs.existsSync(guiPath)) {
      const guiMessages = readTranslations(guiPath);
      gui[language] = guiMessages;
    } else {
      console.warn(`Could not find GUI translations for ${language}`);
    }
  }

  const splashPath = pathUtil.join(translationsDirectory, language, 'splash.csv');
  if (fs.existsSync(splashPath)) {
    const splashMessages = readTranslations(splashPath);
    splash[language] = [
      splashMessages['splash.title'],
      splashMessages['splash.subtitle'],
      splashMessages['splash.troubleshooting']
    ];
  } else {
    console.warn(`Could not find splash translations for ${language}`);
  }
}

const guiPath = pathUtil.join(outputDirectory, 'gui.json');
console.log(`Writing GUI translations to ${guiPath}`);
fs.writeFileSync(guiPath, JSON.stringify(gui, null, 4));

const splashPath = pathUtil.join(outputDirectory, 'splash.json');
console.log(`Writing splash translations to ${splashPath}`);
fs.writeFileSync(splashPath, JSON.stringify(splash));
