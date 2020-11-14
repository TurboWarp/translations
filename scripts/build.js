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

const processTranslations = (fileName) => {
  const englishPath = pathUtil.join(translationsDirectory, 'en', fileName);
  const englishTranslations = readTranslations(englishPath);
  const languages = fs.readdirSync(translationsDirectory);
  const result = {};

  for (const language of languages) {
    if (language === 'en') {
      continue;
    }

    const path = pathUtil.join(translationsDirectory, language, fileName);
    if (!fs.existsSync(path)) {
      console.warn(`${fileName}: Skipping ${language}`);
      continue;
    }

    console.log(`${fileName}: Processing ${language}`);

    const rawMessages = readTranslations(path);
    const messages = {};
    for (const id of Object.keys(rawMessages)) {
      if (rawMessages[id] === englishTranslations[id]) {
        continue;
      }
      messages[id] = rawMessages[id];
    }
    result[language] = messages;
  }

  return result;
};

const processGUI = () => {
  const messages = processTranslations('gui.csv');
  const result = {
    '__README__': 'Imported from https://github.com/TurboWarp/translations -- DO NOT EDIT BY HAND'
  };
  for (const k of Object.keys(messages)) result[k] = messages[k];
  return result;
};

const processSplash = () => {
  const messages = processTranslations('splash.csv');
  const result = {};
  for (const language of Object.keys(messages)) {
    const languageMessages = messages[language];
    result[language] = [
      languageMessages['splash.title'],
      languageMessages['splash.subtitle'],
      languageMessages['splash.troubleshooting']
    ];
  }
  return result;
};

const gui = processGUI();
const splash = processSplash();

const guiPath = pathUtil.join(outputDirectory, 'gui.json');
console.log(`Writing GUI translations to ${guiPath}`);
fs.writeFileSync(guiPath, JSON.stringify(gui, null, 4));

const splashPath = pathUtil.join(outputDirectory, 'splash.json');
console.log(`Writing splash translations to ${splashPath}`);
fs.writeFileSync(splashPath, JSON.stringify(splash));
