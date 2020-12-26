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

const parseGUIMessages = () => {
  const messageFiles = getAllFiles(inputDirectory).filter((file) => file.endsWith('.json'));
  const messages = {};
  
  for (const file of messageFiles) {
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

  return messages;
};

const parseBlocksMessages = () => {
  const path = pathUtil.join(inputDirectory, 'tw.js');
  const messages = {};
  const content = fs.readFileSync(path).toString();
  const matches = content.match(/formatMessage\({[\s\S]+?}/g);
  for (const match of matches) {
    const json = match.match(/{[\s\S]+?}/)[0];
    // I hate this.
    const parsedMessage = eval(`(${json})`);
    const {id, default: def, description} = parsedMessage;
    messages[id] = {
      string: def,
      context: description
    };
  }
  return messages;
};

const guijson = {
  ...parseGUIMessages(),
  ...parseBlocksMessages()
};

uploadResource('guijson', guijson)
  .then((response) => {
    console.log(response);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
