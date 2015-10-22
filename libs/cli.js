#!/usr/bin/env node
var program = require('commander');
var path = require('path');
var Bot = require('./bot');

function run() {
  program
    .version(require('../package.json').version)
    .usage('--config <path>')
    .option('-c, --config <path>', 'Path to configuration file')
    .parse(process.argv);

  if (!program.config) {
    throw "No configuration file given"
  }

  var config = require(path.resolve(process.cwd(), program.config));
  var bot = new Bot(config);
}

module.exports = run;
