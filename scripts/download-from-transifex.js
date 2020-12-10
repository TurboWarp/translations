const Limiter = require('async-limiter');
const fetch = require('node-fetch').default;
const https = require('https');
const fs = require('fs');
const pathUtil = require('path');
const {outputDirectory} = require('./common');

const API_TOKEN = process.env.TRANSIFEX_API_TOKEN;
const AUTHENTICATION = `api:${API_TOKEN}`;
const PROJECT = 'turbowarp';
const SOURCE_LANGUAGE = 'en';

// Re-use a single request agent with keepalive for performance.
const httpsAgent = new https.Agent({
  keepAlive: true
});

const fetchAPI = async (path) => {
  const url = `https://www.transifex.com/api/2/${path}`;
  console.log(` -> ${url}`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(AUTHENTICATION).toString('base64')}`
    },
    agent: httpsAgent
  });
  if (response.status !== 200) {
    throw new Error(`Unexpected status code: ${response.status}`);
  }
  return await response.json();
};

const getProjectDetails = async () => {
  return await fetchAPI(`project/${PROJECT}?details`);
};

const getTranslation = async (resource, language) => {
  const raw = (await fetchAPI(`project/${PROJECT}/resource/${resource}/translation/${language}?mode=onlytranslated`)).content;
  return JSON.parse(raw);
};

const getStats = async (resource) => {
  return await fetchAPI(`project/${PROJECT}/resource/${resource}/stats`);
};

const getLanguagesToDownload = (stats) => {
  const result = [];
  for (const language of Object.keys(stats)) {
    if (stats[language].translated_words > 0) {
      result.push(language);
    }
  }
  return result;
};

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
  const result = {};
  const stats = await getStats(resource);
  const languages = getLanguagesToDownload(stats);

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
    if (language !== SOURCE_LANGUAGE) {
      const scratchLanguage = language.toLowerCase().replace(/_/g, '-');
      result[scratchLanguage] = translations[language];
    }
  }
  const path = pathUtil.join(outputDirectory, 'gui.json');
  fs.writeFileSync(path, JSON.stringify(result, null, 4));
};

(async () => {
  const project = await getProjectDetails();

  /** @type {{slug: string; name: string}[]} */
  const resources = project.resources;

  for (const resource of resources) {
    console.log(`Processing resource: ${resource.name}`);

    const translations = await downloadAllLanguages(resource.slug);

    if (resource.slug === 'splashjson') {
      await processSplash(translations);
    } else if (resource.slug === 'guijson') {
      await processGUI(translations);
    } else {
      throw new Error(`Unknown resource slug: ${resource.slug}`);
    }
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
