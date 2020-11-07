const yaml = require('js-yaml');
const {validateLanguage, validateMessage} = require('./validate-lib');

const m = {
  defaultMessage: '123',
  description: 'abc',
  message: null
};

const expectValidLanguage = (content) => {
  const callback = (e) => {throw e;};
  validateLanguage(content, callback);
};

const expectInvalidLanguage = (content) => {
  let error = false;
  const callback = (e) => error = true;
  validateLanguage(content, callback);
  if (!error) {
    throw new Error('Expected invalid language');
  }
};

const expectValidMessage = (key, message) => {
  validateMessage(key, message);
};

const expectInvalidMessage = (key, message) => {
  try {
    validateMessage(key, message);
    throw new Error('Expected invalid message');
  } catch (e) {
    // OK
  }
}

expectValidLanguage(yaml.safeDump({
  'tw.123': m
}));
expectInvalidLanguage(yaml.safeDump({
  'tw.123': null
}));
expectInvalidLanguage('null');
expectInvalidLanguage('123');
expectInvalidLanguage('"123"');
expectInvalidLanguage('[]');
expectInvalidLanguage('{');
expectInvalidLanguage('e:');

expectValidMessage('tw.123', m);
expectInvalidMessage('abc.123', m);
expectInvalidMessage('tw.123', null);
expectInvalidMessage('tw.123', "null");
expectInvalidMessage('tw.123', 123);
expectInvalidMessage('tw.123', []);
expectInvalidMessage('tw.123', {
  defaultMessage: '123',
  description: 'abc',
});
expectInvalidMessage('tw.123', {
  defaultMessage: '123',
  message: null
});
expectInvalidMessage('tw.123', {
  description: 'abc',
  message: null
});
expectInvalidMessage('tw.123', {
  ...m,
  message: 123
});
expectInvalidMessage('tw.123', {
  ...m,
  description: null
});
expectInvalidMessage('tw.123', {
  ...m,
  defaultMessage: null
});
expectInvalidMessage('tw.123', {
  ...m,
  extra: true
});
expectValidMessage('tw.123', {
  ...m,
  defaultMessage: '{var}',
  message: null
});
expectValidMessage('tw.123', {
  ...m,
  defaultMessage: 'foo {var}',
  message: 'bar {var}'
});
expectInvalidMessage('tw.123', {
  ...m,
  defaultMessage: '{var}',
  message: '{var2}'
});
expectInvalidMessage('tw.123', {
  ...m,
  defaultMessage: '{var}',
  message: 'abc'
});
expectInvalidMessage('tw.123', {
  ...m,
  defaultMessage: '{var}',
  message: '{var}{foo}'
});
expectInvalidMessage('tw.123', {
  ...m,
  defaultMessage: 'foo',
  message: '{bar}'
});
