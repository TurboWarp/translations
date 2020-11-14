const fs = require('fs');
const pathUtil = require('path');

const inputDirectory = pathUtil.join(__dirname, '../in');
const outputDirectory = pathUtil.join(__dirname, '../out');
const translationsDirectory = pathUtil.join(__dirname, '../translations');

if (!fs.existsSync(inputDirectory)) fs.mkdirSync(inputDirectory);
if (!fs.existsSync(outputDirectory)) fs.mkdirSync(outputDirectory);
if (!fs.existsSync(translationsDirectory)) fs.mkdirSync(translationsDirectory);

const pathOfLanguage = (lang) => pathUtil.join(translationsDirectory, lang, 'gui.csv');

module.exports = {
  inputDirectory,
  outputDirectory,
  translationsDirectory,
  pathOfLanguage
};
