var irc = require('irc');
var config = require('../config/config');

var Bot = function(slack) {
  this.client = null;
  this.slack = slack;
}

Bot.prototype.connect = function() {
  // Initialize the IRC connection and connect the server if the IRC channel
  // is not password-protected.
  this.client = new irc.Client(config.irc.server, config.irc.nick, {
    port: config.irc.port || 6667,
    channels: (config.irc.channel.protected ? undefined : [config.irc.channel.name]),
    localAddress: config.irc.localAddress,
    userName: config.irc.userName,
    realName: config.irc.realName,
    debug: config.irc.debug,
    autoConnect: !config.irc.channel.protected
  });

  // Handler for IRC channel messages. Messages are sent to the Slack channel.
  this.client.addListener('message', function(from, to, text, message) {
    if (from !== config.irc.nick) {
      var chan = slack.getChannelByName(config.slack.channel);
      var msg = from + "@IRC>" + text;
      return chan.send(msg);
    }
  });

  // Join the password-protected channel after the IRC server has been connected.
  if (config.irc.channel.protected) {
    this.client.connect(function() {
      this.send('JOIN', config.irc.channel.name, config.irc.channel.password);
    });
  }
}

Bot.prototype.send = function(name, msg) {
    this.client.say(config.irc.channel.name, name + "> " + msg);
}

module.exports = Bot;
