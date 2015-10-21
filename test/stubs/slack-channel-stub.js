var util = require('util');
var events = require('events');
var sinon = require('sinon');

function SlackChannelStub() {
  this.name = 'slackChannel';
}

util.inherits(SlackChannelStub, events.EventEmitter);

SlackChannelStub.prototype.send = sinon.stub();

module.exports = SlackChannelStub;
