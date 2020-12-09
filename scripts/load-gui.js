const fs = require('fs');
const pathUtil = require('path');

const {
  translationsDirectory,
  inputDirectory
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

const buildJSON = (messages) => {
  const result = {};
  for (const id of Object.keys(messages)) {
    const {message, context} = messages[id];
    result[id] = {
      string: message,
      context
    };
  }
  return JSON.stringify(result, null, 4);
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

const result = buildJSON(messages);
const englishPath = pathUtil.join(translationsDirectory, 'en', 'gui.json');
console.log(`Writing English translations to ${englishPath}`);
fs.writeFileSync(englishPath, result);
