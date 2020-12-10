const Limiter = require('async-limiter');
const fs = require('fs');
const pathUtil = require('path');
const {outputDirectory} = require('./common');
const {
  getTranslation,
  getResourceLanguages
} = require('./transifex');

const SOURCE_LANGUAGE = 'en';

const limiterDone = (limiter) => new Promise((resolve, reject) => {
  limiter.onDone(() => {
    resolve();
  });
});

const removeEmptyMessages = (messages) => {
  const result = {};
  for (const id of Object.keys(messages)) {
    const string = messages[id].string;
    if (string) {
      result[id] = string;
    }
  }
  return result;
};

const downloadAllLanguages = async (resource) => {
  console.log(`Downloading ${resource.replace('json', '.json')}`);

  const result = {};
  const languages = await getResourceLanguages(resource);

  const limiter = new Limiter({
    concurrency: 5
  });
  for (const language of languages) {
    limiter.push(async (callback) => {
      const translations = await getTranslation(resource, language);
      result[language] = removeEmptyMessages(translations);
      callback();
    });
  }
  await limiterDone(limiter);

  return result;
};

const processSplash = (translations) => {
  const result = {};
  for (const language of Object.keys(translations)) {
    const messages = translations[language];
    const title = messages['splash.title'];
    const subtitle = messages['splash.subtitle'];
    const troubleshooting = messages['splash.troubleshooting'];
    if (title && subtitle && troubleshooting) {
      result[language] = [
        title,
        subtitle,
        troubleshooting
      ];
    }
  }
  const path = pathUtil.join(outputDirectory, 'splash.json');
  fs.writeFileSync(path, JSON.stringify(result));
};

const processGUI = (translations) => {
  const result = {
    '__README__': 'Imported from https://github.com/TurboWarp/translations -- DO NOT EDIT BY HAND'
  };
  for (const language of Object.keys(translations)) {
    const scratchLanguage = language.toLowerCase().replace(/_/g, '-');
    result[scratchLanguage] = translations[language];
  }
  const path = pathUtil.join(outputDirectory, 'gui.json');
  fs.writeFileSync(path, JSON.stringify(result, null, 4));
};

(async () => {
  const guiMessages = await downloadAllLanguages('guijson');
  const splashMessages = await downloadAllLanguages('splashjson');

  processGUI(guiMessages);
  processSplash(splashMessages);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
