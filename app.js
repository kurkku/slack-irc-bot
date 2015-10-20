#!/usr/bin/env node

var config = require('./config/config');
var Bot = require('./libs/bot');
var Slack = require('slack-client');
var assert = require('assert');

assert(config.slack.token !== "", "Slack token not defined");
assert(config.irc.nick !== "", "IRC nick not defined");

// Create Slack and IRC bot objects
slack = new Slack(config.slack.token, config.slack.autoReconnect, config.slack.autoMark);
var ircbot = new Bot(slack);

// Slack login handler
slack.on('open', function() {
  return console.log("Connected to " + slack.team.name + " as @" + slack.self.name);
});

// Slack error handler
slack.on('error', function(err) {
  return console.error("Error", err);
});

// Slack message handler
slack.on('message', function(message) {
  var user = slack.getUserByID(message.user);
  var channel = slack.getChannelGroupOrDMByID(message.channel);

  // Don't show hidden messages
  if ((message.hidden != null) && message.hidden === true) {
    return;
  }

  // Print fallback attachments from bot messages
  if ((message.subtype != null) && message.subtype === 'bot_message') {
    if (message.attachments[0].fallback != null) {
      return ircbot.send("bot", message.attachments[0].fallback);
    }
  }

  // User messages that are sent to the named Slack channel.
  if ((user.name != null) && channel.name === config.slack.channel) {
    var msg = message.text;

    // Replace first Slack user ID from the message to user name (if any).
    var nick_re = /<[@]?(\w*)>/;
    var match = nick_re.exec(msg);
    if (match != null) {
      var repl = slack.getUserByID(match[1]);
      if (repl != null) {
        var msg = msg.replace(nick_re, repl.name);
      }
    }

    // Send the message to IRC channel.
    return ircbot.send(user.name, msg);
  }
});

// Connect IRC and Slack
ircbot.connect();
slack.login();
