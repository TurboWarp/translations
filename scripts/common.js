const fs = require('fs');
const pathUtil = require('path');

const inputDirectory = pathUtil.join(__dirname, '../in');
const outputDirectory = pathUtil.join(__dirname, '../out');

if (!fs.existsSync(inputDirectory)) fs.mkdirSync(inputDirectory);
if (!fs.existsSync(outputDirectory)) fs.mkdirSync(outputDirectory);

module.exports = {
  inputDirectory,
  outputDirectory
};
