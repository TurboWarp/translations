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

const simplifyMessages = (messages, source) => {
  const result = {};
  for (const id of Object.keys(messages).sort()) {
    const string = typeof messages[id] === 'string' ? messages[id] : messages[id].string;
    if (string) {
      if (string !== source[id].string) {
        result[id] = string;
      }
    }
  }
  return result;
};

const sortProperties = (obj) => {
  const result = {};
  for (const key of Object.keys(obj).sort()) {
    result[key] = obj[key];
  }
  return result;
};

const downloadAllLanguages = async (resource) => {
  const result = {};
  const source = await getTranslation(resource, SOURCE_LANGUAGE);
  const languages = await getResourceLanguages(resource);

  const limiter = new Limiter({
    concurrency: 5
  });
  for (const language of languages) {
    limiter.push(async (callback) => {
      const translations = await getTranslation(resource, language);
      result[language] = simplifyMessages(translations, source);
      callback();
    });
  }
  await limiterDone(limiter);

  return sortProperties(result);
};

const processSplash = (translations) => {
  const result = {};
  for (const language of Object.keys(translations)) {
    const messages = translations[language];
    const title = messages['splash.title'];
    const subtitle = messages['splash.subtitle'];
    const troubleshooting = messages['splash.troubleshooting'];
    if (title && subtitle && troubleshooting) {
      const parsedLanguage = language.replace('_', '-').toLowerCase();
      result[parsedLanguage] = [
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
  const result = {};
  for (const language of Object.keys(translations)) {
    const scratchLanguage = language.toLowerCase().replace(/_/g, '-');
    result[scratchLanguage] = translations[language];
  }
  const path = pathUtil.join(outputDirectory, 'gui.json');
  fs.writeFileSync(path, JSON.stringify(result, null, 4));
};

const processAddons = (translations) => {
  const result = {};
  for (const language of Object.keys(translations)) {
    const scratchLanguage = language.toLowerCase().replace(/_/g, '-');
    result[scratchLanguage] = translations[language];
  }
  const path = pathUtil.join(outputDirectory, 'addons.json');
  fs.writeFileSync(path, JSON.stringify(result, null, 4));
};

const processDesktop = (translations) => {
  const result = {};
  for (const language of Object.keys(translations)) {
    const scratchLanguage = language.toLowerCase().replace(/_/g, '-');
    result[scratchLanguage] = translations[language];
  }
  const path = pathUtil.join(outputDirectory, 'desktop.json');
  fs.writeFileSync(path, JSON.stringify(result, null, 4));
};

const processDesktopWeb = (translations) => {
  const result = {};
  for (const language of Object.keys(translations)) {
    const scratchLanguage = language.toLowerCase().replace(/_/g, '-');
    result[scratchLanguage] = translations[language];
  }
  const path = pathUtil.join(outputDirectory, 'desktop-web.json');
  fs.writeFileSync(path, JSON.stringify(result, null, 4));
};

(async () => {
  const [
    guiMessages,
    splashMessages,
    addonMessages,
    desktopMessages,
    desktopWebMessages
  ] = await Promise.all([
    downloadAllLanguages('guijson'),
    downloadAllLanguages('splashjson'),
    downloadAllLanguages('addonsjson'),
    downloadAllLanguages('desktopjson'),
    downloadAllLanguages('desktop-webjson')
  ]);

  processGUI(guiMessages);
  processSplash(splashMessages);
  processAddons(addonMessages);
  processDesktop(desktopMessages);
  processDesktopWeb(desktopWebMessages);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
