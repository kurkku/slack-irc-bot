var config = module.exports = {};

config.slack = {
  token: "",
  autoReconnect: true,
  autoMark: true,
  channel: "slackChannel"
};

config.irc = {
  server: "eu.irc6.net",
  //port: 6667,
  nick: "",
  userName: "",
  realName: "Magical pipe from Slack to IRC and back",
  //localAddress: "",
  debug: false,
  encoding: 'utf8',
  channel: {
    name: "#ircChannel",
    protected: false,
    password: ""
  }
}
