#!/usr/bin/env node

var Bot = require('./libs/bot');
var cli = require('./libs/cli');

if (!module.parent) {
  cli();
}

function create(config) {
  return new Bot(config);
}

module.exports = create;
