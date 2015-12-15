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
    Bot.__set__('Bot.slack', SlackStub);
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
    };
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
    };
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
    };
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
  });

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
    };
    this.bot.sendToIRC(slackMessage);
    var textAssert = 'bot> I AM A ROBOT';
    IrcClientStub.prototype.say.should.not.have.been.called;
  });

  it("should convert timestamps to readable date strings", function() {
    var msg1 = "Remember the Task: <!date^1446102000^{date_short_pretty}|Oct 29, 2015> to <!date^1446274800^{date_short_pretty}|Oct 31, 2015 PDT>";
    var d1 = new Date(1446102000 * 1000);
    var d2 = new Date(1446274800 * 1000);
    var correct = "Remember the Task: " + d1 + " to " + d2;
    this.bot.decode(msg1).should.equal(correct);

    var msg2 = "<!date^1469703600^{date_short_pretty} from {time}|Jul 28, 2016 from 2:00 PM> to <!date^1469966400^{date_short_pretty} at {time}|Jul 31, 2016 at 3:00 PM GMT+0300>";
    d1 = new Date(1469703600 * 1000);
    d2 = new Date(1469966400 * 1000);
    correct = d1 + " to " + d2;
    this.bot.decode(msg2).should.equal(correct);
  });

});
