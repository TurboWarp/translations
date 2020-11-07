const fs = require('fs');
const pathUtil = require('path');

const YAML = require('./yaml');
const {
  LANGUAGES_DIR,
  LANGUAGES,
  OUT_DIR
} = require('./common');

require('./validate');

const readLanguage = (lang) => {
  const languageFile = pathUtil.join(LANGUAGES_DIR, `${lang}.yaml`);
  const content = fs.readFileSync(languageFile, { encoding: 'utf8' });
  const parsedMessages = YAML.parse(content);
  const result = {};
  for (const key of Object.keys(parsedMessages)) {
    const value = parsedMessages[key];
    const message = value.message;
    const defaultMessage = value.defaultMessage;
    // Do not write missing messages, or messages that are identical to their English translation.
    if (message && message !== defaultMessage) {
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
