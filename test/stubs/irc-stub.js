var util = require('util');
var events = require('events');
var sinon = require('sinon');

function IrcClientStub() {}

util.inherits(IrcClientStub, events.EventEmitter);

IrcClientStub.prototype.connect = sinon.stub();
IrcClientStub.prototype.say = sinon.stub();
IrcClientStub.prototype.send = sinon.stub();
IrcClientStub.prototype.join = sinon.stub();

module.exports = IrcClientStub;
