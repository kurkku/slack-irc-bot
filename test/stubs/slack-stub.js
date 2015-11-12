var util = require('util');
var events = require('events');
var sinon = require('sinon');
var SlackChannelStub = require('./slack-channel-stub');

function SlackStub() {
  this.wrong = false;
}

util.inherits(SlackStub, events.EventEmitter);

SlackStub.prototype.getChanStub = function() {
  if (this.wrong) {
    return null;
  }
  return new SlackChannelStub();
};

SlackStub.prototype.login = sinon.stub();
SlackStub.prototype.getChannelGroupOrDMByID = SlackStub.prototype.getChanStub;
SlackStub.prototype.getChannelGroupOrDMByName = SlackStub.prototype.getChanStub;
SlackStub.prototype.getChannelByName = SlackStub.prototype.getChanStub;

SlackStub.prototype.getUserByID = function() {
  if (this.wrong) {
    return {
      name: 'some_unknown'
    };
  }

  return {
    name: 'john_doe'
  };
};

SlackStub.prototype.reset = function() {
  this.wrong = false;
};

module.exports = SlackStub;
