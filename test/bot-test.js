var chai = require('chai');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');
var irc = require('irc');
var Bot = rewire('../libs/bot');
var SlackStub = require('./stubs/slack-stub');
var SlackChannelStub = require('./stubs/slack-channel-stub');
var IrcClientStub = require('./stubs/irc-stub');
var config = require('./fixtures/valid-config.json');

chai.should();
chai.use(sinonChai);

describe('Bot functionality', function() {
  before(function() {
    irc.Client = IrcClientStub;
    Bot.__set__('Slack', SlackStub);
    this.bot = new Bot(config);
    this.bot.connect();
  });

  afterEach(function() {
    IrcClientStub.prototype.say.reset();
    SlackChannelStub.prototype.send.reset();
    this.bot.slack.reset();
  });

  it("should send a slack user message to irc", function() {
    var text = 'Hello world!';
    var slackMessage = {
      type: 'message',
      getBody: function() {
        return text;
      }
    };
    this.bot.sendToIRC(slackMessage);
    var textAssert = 'john_doe> ' + text;
    IrcClientStub.prototype.say.should.have.been.calledWith('#ircChannel', textAssert);
  });

  it("should send an irc message to slack", function() {
    var from = 'john_doe';
    var message = 'Hello world!';
    this.bot.sendToSlack(from, message);
    SlackChannelStub.prototype.send.should.have.been.calledWith('john_doe@IRC> Hello world!');
  });

  it("should send a slack bot message to irc", function() {
    var fallback = "I AM A ROBOT";
    var slackMessage = {
      type: 'message',
      subtype: 'bot_message',
      attachments: [
        {fallback: fallback}
      ]
    }
    this.bot.sendToIRC(slackMessage);
    var textAssert = 'bot> I AM A ROBOT';
    IrcClientStub.prototype.say.should.have.been.calledWith('#ircChannel', textAssert);
  });

  it("should not send hidden slack messages to irc", function() {
    var text = 'Hello world!';
    var slackMessage = {
      type: 'message',
      hidden: true,
      getBody: function() {
        return text;
      }
    }
    this.bot.sendToIRC(slackMessage);
    IrcClientStub.prototype.say.should.not.have.been.called;
  });

  it("should parse user ids from slack messages", function() {
    var text = 'Hello <@USERID> and <@USERID|detritius>, how are you?';
    var slackMessage = {
      type: 'message',
      getBody: function() {
        return text;
      }
    }
    this.bot.sendToIRC(slackMessage);
    var textAssert = 'john_doe> ' + 'Hello john_doe and detritius, how are you?';
    IrcClientStub.prototype.say.should.have.been.calledWith('#ircChannel', textAssert);
  });

  it("should decode slack text correctly", function() {
    this.bot.decode(':smile: :confused: :laughing: :stuck_out_tongue: :rage: :smiling_imp:').should.equal(':) :( :D :P >:( >:)');
    this.bot.decode(':joy: :stuck_out_tongue_winking_eye: :stuck_out_tongue_closed_eyes: :open_mouth:').should.equal(':´D ;P XP :O');
    this.bot.decode('>>><<<').should.equal('>>><<<');
    this.bot.decode('&&abc&&').should.equal('&&abc&&');
    this.bot.decode('öäå€').should.equal('öäå€');
    this.bot.decode("<https://github.com/kurkku>").should.equal('https://github.com/kurkku');
  });

  it("should not send messages from a wrong irc channel", function() {
    this.bot.slack.wrong = true;
    var text = 'Hello world!';
    var slackMessage = {
      type: 'message',
      getBody: function() {
        return text;
      }
    };
    this.bot.sendToIRC(slackMessage);
    IrcClientStub.prototype.say.should.not.have.been.called;
  })

  it("should not send unsupported slack messages to irc", function() {
    var text = 'Hello world!';
    var slackMessage = {
      type: 'message',
      subtype: 'channel_join',
      getBody: function() {
        return text;
      }
    };
    this.bot.sendToIRC(slackMessage);
    IrcClientStub.prototype.say.should.not.have.been.called;
  });

  it("should not send a slack bot message if there isn't a fallback", function() {
    var fallback = "I AM A ROBOT";
    var slackMessage = {
      type: 'message',
      subtype: 'bot_message',
      attachments: []
    }
    this.bot.sendToIRC(slackMessage);
    var textAssert = 'bot> I AM A ROBOT';
    IrcClientStub.prototype.say.should.not.have.been.called;
  });

});
