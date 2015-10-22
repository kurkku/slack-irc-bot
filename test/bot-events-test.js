var chai = require('chai');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');
var sinon = require('sinon');
var irc = require('irc');
var Bot = rewire('../libs/bot');
var SlackStub = require('./stubs/slack-stub');
var SlackChannelStub = require('./stubs/slack-channel-stub');
var IrcClientStub = require('./stubs/irc-stub');
var config = require('./fixtures/valid-config.json');

chai.should();
chai.use(sinonChai);

describe('Bot events', function() {
  before(function() {
    irc.Client = IrcClientStub;
    Bot.__set__('Slack', SlackStub);
    Bot.prototype.sendToIRC = sinon.stub();
    Bot.prototype.sendToSlack = sinon.stub();
    this.bot = new Bot(config);
    this.bot.connect();
  });

  beforeEach(function() {
    sinon.spy(console, 'log');
    sinon.spy(console, 'error');
  });

  afterEach(function() {
    IrcClientStub.prototype.say.reset();
    SlackChannelStub.prototype.send.reset();
    this.bot.slack.reset();
    console.log.restore();
    console.error.restore();
  });

  it("should log on slack open event", function() {
    this.bot.slack.emit('open');
    console.log.should.have.been.calledWith('Connected to Slack');
  });

  it("should send messages to irc", function() {
    var message = {
      type: 'message'
    }
    this.bot.slack.emit('message', message);
    Bot.prototype.sendToIRC.should.have.been.calledWith(message);
  });

  it("should send messages to slack", function() {
    var from = 'john_doe';
    var to = 'some_channel';
    var text = 'Hello world!';
    var message = "...";
    this.bot.irc.emit('message', from, to, text, message);
    Bot.prototype.sendToSlack.should.have.been.calledWith('john_doe', 'Hello world!');
  });

  it("should write error messages to console", function() {
    var slackErr = new Error('slack error');
    this.bot.slack.emit('error', slackErr);
    console.error.should.have.been.calledOnce;
    console.error.should.have.been.calledWith('Slack error', slackErr);

    var ircErr = new Error('irc error');
    this.bot.irc.emit('error', ircErr);
    console.error.should.have.been.calledTwice;
    console.error.should.have.been.calledWith('IRC error', ircErr);
  });

});
