var irc = require('irc');
var Slack = require('slack-client');
var assert = require('assert');

function Bot(config) {

  this.config = config;

  assert(config.slack.token !== "", "Slack token not defined");
  assert(config.irc.nick !== "", "IRC nick not defined");

  this.irc = new irc.Client(config.irc.server, config.irc.nick, {
    port: config.irc.port || 6667,
    channels: (config.irc.channel.protected ? undefined : [config.irc.channel.name]),
    localAddress: config.irc.localAddress,
    userName: config.irc.userName,
    realName: config.irc.realName,
    debug: config.irc.debug,
    encoding: config.irc.encoding,
    autoConnect: false
  });

  this.slack = new Slack(config.slack.token, config.slack.autoReconnect,
    config.slack.autoMark);

  this.addListeners();
  this.connect();
}

Bot.prototype.addListeners = function() {
  this.slack.on('open', function() {
    console.log("Connected to Slack");
  });

  this.slack.on('error', function(err) {
    console.error("Slack error", err);
  });

  this.irc.on('error', function(err) {
    console.error("IRC error", err);
  });

  // Handler for Slack messages.
  this.slack.on('message', function(message) {
    this.sendToIRC(message);
  }.bind(this));

  // Handler for IRC channel messages.
  this.irc.on('message', function(from, to, text, message) {
    this.sendToSlack(from, text);
  }.bind(this));
};

Bot.prototype.connect = function() {
  console.log("Connecting servers...");
  this.slack.login();

  // Join the password-protected channel after the IRC server has been connected.
  if (this.config.irc.channel.protected === true) {
    this.irc.connect(function() {
      this.send('JOIN', this.config.irc.channel.name, this.config.irc.channel.password);
    });
  } else {
    this.irc.connect();
  }
};

Bot.prototype.sendToSlack = function(from, text) {
  var chan = this.slack.getChannelByName(this.config.slack.channel);
  chan.send(from + '@IRC> ' + text);
};

Bot.prototype.sendToIRC = function(message) {
  // Skip unsupported subtypes
  if (message.subtype !== null && message.subtype !== 'bot_message') {
    return;
  }

  // Skip hidden messages, such as edited messages.
  if (message.hidden !== null && message.hidden === true) {
    return;
  }

  var channel = this.slack.getChannelGroupOrDMByID(message.channel);
  if (!channel || (channel.name !== this.config.slack.channel)) {
    return;
  }

  // Bot messages
  if (message.subtype !== null && message.subtype === 'bot_message') {
    if (message.attachments !== null && message.attachments.length > 0 && message.attachments[0].fallback) {
      this.irc.say(this.config.irc.channel.name, "bot> " + message.attachments[0].fallback);
    }
    return;
  }

  // User messages
  var body = this.decode(message.getBody());

  var user = this.slack.getUserByID(message.user);
  var msg = user.name + '> ' + body;
  this.irc.say(this.config.irc.channel.name, msg);
};

Bot.prototype.decode = function(str) {
  return str
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/<@(U\w+)\|?(\w+)?>/g, function(match, uid, plain) {
      return plain || this.slack.getUserByID(uid).name;
    }.bind(this))
    .replace(/<(\S+)>/g, function(m, url) {
      return url;
    })
    .replace(/:smile:|:smiley:|:blush:|:relaxed:|:relieved:/g, ':)')
    .replace(/:confused:|:disappointed:|:worried:/g, ':(' )
    .replace(/:wink:/g, ';)')
    .replace(/:joy:/g, ':´D')
    .replace(/:grinning:|:grin:|:laughing:/g, ':D')
    .replace(/:stuck_out_tongue:/g, ':P')
    .replace(/:stuck_out_tongue_winking_eye:/g, ';P')
    .replace(/:stuck_out_tongue_closed_eyes:/g, 'XP')
    .replace(/:open_mouth:|:hushed:|:astonished:|:scream:|:dizzy_face:|:flushed:/g, ':O')
    .replace(/:rage:|:imp:/g, '>:(')
    .replace(/:smiling_imp:/g, '>:)');
};

module.exports = Bot;
