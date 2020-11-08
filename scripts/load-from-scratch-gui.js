const fs = require('fs');
const pathUtil = require('path');

const YAML = require('./yaml');
const {
  LANGUAGES_DIR,
  IN_DIR,
  LANGUAGES
} = require('./common');

const getAllFiles = (directory) => {
  const children = fs.readdirSync(directory);
  const result = [];
  for (const name of children) {
    const path = pathUtil.join(directory, name);
    const stat = fs.statSync(path);
    if (stat.isDirectory()) {
      const directoryChildren = getAllFiles(path);
      for (const childName of directoryChildren) {
        result.push(pathUtil.join(name, childName));
      }
    } else {
      result.push(name);
    }
  }
  return result;
};

const scanMessages = (path) => {
  const content = fs.readFileSync(path, { encoding: 'utf8' });
  const parsedMessages = JSON.parse(content);
  return parsedMessages
    .filter((message) => message.id.startsWith('tw.'));
};

const mergeTranslations = (existing, messages) => {
  // Make a copy, we will be doing some in-place modifications
  const result = JSON.parse(JSON.stringify(messages));

  // Copy values from the existing translations to the new.
  for (const key of Object.keys(result)) {
    const value = result[key];
    const existingValue = existing[key];
    if (existingValue) {
      // If the english version changed, do not copy.
      if (existingValue.englishMessage === value.defaultMessage) {
        value.message = existingValue.message;
      } else {
        value.message = null;
      }
    } else {
      value.message = null;
    }
  }
  for (const key of Object.keys(existing)) {
    if (!result.hasOwnProperty(key)) {
      console.warn(`Not copying translation: removed: ${key}`);
    }
  }

  return result;
};

const readLanguageFile = (path) => {
  if (!fs.existsSync(path)) {
    return {};
  }
  const content = fs.readFileSync(path, { encoding: 'utf8' });
  return YAML.parse(content, {
    prettyErrors: true
  });
};

const processLanguage = (lang, messages) => {
  const languageFilePath = pathUtil.join(LANGUAGES_DIR, `${lang}.yaml`);
  const languageFile = readLanguageFile(languageFilePath);
  const translations = mergeTranslations(languageFile, messages);
  fs.writeFileSync(languageFilePath, YAML.stringify(translations));
};

const messageFiles = getAllFiles(IN_DIR);
const messages = {};

for (const file of messageFiles) {
  if (!file.endsWith('.json')) {
    console.warn(`Skipping ${file}: not json`);
    continue;
  }

  const path = pathUtil.join(IN_DIR, file);
  const processed = scanMessages(path);

  for (const message of processed) {
    const {id, defaultMessage, description} = message;
    messages[id] = {
      englishMessage: defaultMessage,
      description
    };
  }
}

for (const language of Object.keys(LANGUAGES)) {
  console.log(`Processing ${language}`);
  processLanguage(language, messages);
}
