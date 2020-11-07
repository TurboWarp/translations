const YAML = require('yaml');

YAML.scalarOptions.str.fold.lineWidth = 100000000;

module.exports = YAML;
