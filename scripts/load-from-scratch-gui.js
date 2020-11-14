const fs = require('fs');
const pathUtil = require('path');

const Papa = require('papaparse');
const {
  inputDirectory,
  pathOfLanguage
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

const readMessages = (path) => {
  const content = fs.readFileSync(path, { encoding: 'utf8' });
  const parsedMessages = JSON.parse(content);
  return parsedMessages
    .filter((message) => message.id.startsWith('tw.'));
};

const buildCSV = (messages) => {
  const lines = [];
  for (const id of Object.keys(messages)) {
    const {message, context} = messages[id];
    lines.push([id, context, message]);
  }
  return Papa.unparse(lines);
};

const messageFiles = getAllFiles(inputDirectory);
const messages = {};

for (const file of messageFiles) {
  if (!file.endsWith('.json')) {
    console.warn(`Skipping ${file}: not json`);
    continue;
  }

  const path = pathUtil.join(inputDirectory, file);
  const processed = readMessages(path);

  for (const message of processed) {
    const {id, defaultMessage, description} = message;
    messages[id] = {
      message: defaultMessage,
      context: description
    };
  }
}

const result = buildCSV(messages);

const englishPath = pathOfLanguage('en');
console.log(`Writing English translations to ${englishPath}`);
fs.writeFileSync(englishPath, result);
