const fs = require('fs');
const pathUtil = require('path');
const {inputDirectory} = require('./common');
const {uploadResource} = require('./transifex');

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
      string: defaultMessage,
      context: description
    };
  }
}

uploadResource('guijson', messages)
  .then((response) => {
    console.log(response);
  });
