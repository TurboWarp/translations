const fs = require('fs');
const pathUtil = require('path');

const Papa = require('papaparse');
const {
  inputDirectory,
  translationsDirectory,
  pathOfLanguage,
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

const result = {
  '__README__': 'Imported from https://github.com/TurboWarp/translations -- DO NOT EDIT BY HAND'
};

const languages = fs.readdirSync(translationsDirectory);
for (const language of languages) {
  if (language === 'en') {
    continue;
  }
  console.log(`Processing ${language}`);
  const translationFile = pathOfLanguage(language);
  const messages = readTranslations(translationFile);
  result[language] = messages;
  console.log(messages);
}

const outPath = pathUtil.join(outputDirectory, 'translations.json');
console.log(`Writing translations to ${outPath}`);
fs.writeFileSync(outPath, JSON.stringify(result, null, 4));
