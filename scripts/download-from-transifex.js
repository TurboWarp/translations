const Limiter = require('async-limiter');
const fs = require('fs');
const pathUtil = require('path');
const {outputDirectory} = require('./common');
const {
  getTranslation,
  getResourceLanguages
} = require('./transifex');

const SOURCE_LANGUAGE = 'en';

const scratchGuiPath = pathUtil.resolve(__dirname, '../../scratch-gui');
const desktopPath = pathUtil.resolve(__dirname, '../../turbowarp-desktop');

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

const processTranslations = (obj) => {
  const result = {};
  for (const key of Object.keys(obj).sort()) {
    const newKey = key.replace('_', '-').toLowerCase();
    result[newKey] = obj[key];
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

  return processTranslations(result);
};

const writeToOutFile = (file, json) => {
  const path = pathUtil.join(outputDirectory, file);
  fs.writeFileSync(path, JSON.stringify(json, null, 4));
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
  writeToOutFile('splash.json', result);
  if (fs.existsSync(scratchGuiPath)) {
    const indexejs = pathUtil.join(scratchGuiPath, 'src/playground/index.ejs');
    const oldContent = fs.readFileSync(indexejs, 'utf-8');
    const newContent = oldContent.replace(/\/\*===\*\/[\s\S]+\/\*===\*\//m, `/*===*/${JSON.stringify(result)}/*===*/`);
    if (newContent !== oldContent) {
      console.log('Updating splash.json');
      fs.writeFileSync(indexejs, newContent);
    }
  }
};

const processGUI = (translations) => {
  writeToOutFile('gui.json', translations);
  if (fs.existsSync(scratchGuiPath)) {
    console.log('Updating gui.json');
    fs.writeFileSync(pathUtil.join(scratchGuiPath, 'src/lib/tw-translations/translations.json'), JSON.stringify(translations, null, 4));
  }
};

const processAddons = (translations) => {
  writeToOutFile('addons.json', translations);
  if (fs.existsSync(scratchGuiPath)) {
    console.log('Updating addons.json');
    fs.writeFileSync(pathUtil.join(scratchGuiPath, 'src/addons/settings/l10n/translations.json'), JSON.stringify(translations, null, 4));
  }
};

const processDesktop = (translations) => {
  writeToOutFile('desktop.json', translations);
  if (fs.existsSync(desktopPath)) {
    console.log('Updating desktop.json');
    fs.writeFileSync(pathUtil.join(desktopPath, 'src/l10n/translations.json'), JSON.stringify(translations, null, 4));
  }
};

const processDesktopWeb = (translations) => {
  writeToOutFile('desktop-web.json', translations);
  if (fs.existsSync(desktopPath)) {
    const index = pathUtil.join(desktopPath, 'docs/index.html');
    const oldContent = fs.readFileSync(index, 'utf-8');
    const newContent = oldContent.replace(/\/\*===\*\/[\s\S]+\/\*===\*\//m, `/*===*/${JSON.stringify(translations)}/*===*/`);
    if (newContent !== oldContent) {
      console.log('Updating desktop-web.json');
      fs.writeFileSync(index, newContent);
    }
  }
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
