const fs = require('fs');
const pathUtil = require('path');
const yaml = require('js-yaml');

require('./validate');

const {
  LANGUAGES_DIR,
  LANGUAGES,
  OUT_DIR
} = require('./common');

const readLanguage = (lang) => {
  const languageFile = pathUtil.join(LANGUAGES_DIR, `${lang}.yaml`);
  const content = fs.readFileSync(languageFile, { encoding: 'utf8' });
  const parsedMessages = yaml.safeLoad(content);
  const result = {};
  for (const key of Object.keys(parsedMessages)) {
    const message = parsedMessages[key].message;
    // Do not write missing messages.
    if (message) {
      result[key] = message;
    }
  }
  return result;
};

const outputLanguage = (lang, processed) => {
  const outFile = pathUtil.join(OUT_DIR, `${lang}.json`);
  fs.writeFileSync(outFile, JSON.stringify(processed));
};

for (const lang of Object.keys(LANGUAGES)) {
  console.log(`Processing ${lang}`);
  const processed = readLanguage(lang);
  outputLanguage(lang, processed);
}
