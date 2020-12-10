const fetch = require('node-fetch').default;
const https = require('https');

const API_TOKEN = process.env.TRANSIFEX_API_TOKEN;
const AUTHENTICATION = `api:${API_TOKEN}`;
const PROJECT = 'turbowarp';

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

const getTranslation = async (resource, language) => {
  const raw = (await fetchAPI(`project/${PROJECT}/resource/${resource}/translation/${language}?mode=onlytranslated`)).content;
  return JSON.parse(raw);
};

const getStats = async (resource) => {
  return await fetchAPI(`project/${PROJECT}/resource/${resource}/stats`);
};

const getResourceLanguages = async (resource) => {
  const stats = await getStats(resource);
  const result = [];
  for (const language of Object.keys(stats)) {
    if (stats[language].translated_words > 0) {
      result.push(language);
    }
  }
  return result;
};

module.exports = {
  getTranslation,
  getStats,
  getResourceLanguages
};
