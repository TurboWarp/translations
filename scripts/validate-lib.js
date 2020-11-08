const YAML = require('./yaml');

const isObject = (val) => typeof val === 'object' && val !== null && !Array.isArray(val);

const validateLanguage = (content, errorCallback) => {
  let parsedContent;
  try {
    parsedContent = YAML.parse(content, {
      prettyErrors: true
    });
  } catch (e) {
    errorCallback(new Error(`Invalid YAML: ${e.message}`));
    return;
  }

  if (!isObject(parsedContent)) {
    errorCallback(new Error(`Not an Object`));
    return;
  }

  for (const key of Object.keys(parsedContent)) {
    try {
      const value = parsedContent[key];
      validateMessage(key, value);
    } catch (err) {
      errorCallback(err);
    }
  }
};

const validateMessage = (key, value) => {
  if (!key.startsWith('tw.')) {
    throw new Error(`${key}: Does not start with tw.`);
  }

  if (!isObject(value)) {
    throw new Error(`${key}: Not an object`);
  }
  const valueKeys = Object.keys(value);

  if (!valueKeys.includes('message')) {
    throw new Error(`${key}: Missing "message"`);
  }
  if (typeof value.message !== 'string' && value.message !== null) {
    throw new Error(`${key}: Invalid "message" (not null or string)`);
  }

  if (!valueKeys.includes('description')) {
    throw new Error(`${key}: Missing "description"`)
  }
  if (typeof value.description !== 'string') {
    throw new Error(`${key}: Invalid "description"`);
  }

  if (!valueKeys.includes('englishMessage')) {
    throw new Error(`${key}: Missing "englishMessage"`);
  }
  if (typeof value.englishMessage !== 'string') {
    throw new Error(`${key}: Invalid "englishMessage"`);
  }

  if (valueKeys.length !== 3) {
    throw new Error(`${key}: Has extra properties`);
  }

  if (value.message !== null) {
    const englishVariables = value.englishMessage.match(/{\w+}/g);
    const englishVariableCount = englishVariables === null ? 0 : englishVariables.length;
    const messageVariables = value.message.match(/{\w+}/g);
    const messageVariablesCount = messageVariables === null ? 0 : messageVariables.length;

    if (englishVariableCount !== messageVariablesCount) {
      throw new Error(`${key}: Incorrect number of variables: expected ${englishVariableCount} but found ${messageVariablesCount}`);
    }

    for (let i = 0; i < messageVariablesCount; i++) {
      if (englishVariables[i] !== messageVariables[i]) {
        throw new Error(`${key}: Incorrect variables: expected ${englishVariables[i]} but found ${messageVariables[i]}`);
      }
    }
  }
};

module.exports = {
  validateLanguage,
  validateMessage
};
