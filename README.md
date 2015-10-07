slack-irc-bot is a Slack to IRC bot written in [JavaScript](http://en.wikipedia.org/wiki/JavaScript) for [Node](http://nodejs.org/).

The application passes messages between a Slack channel and an IRC channel in both directions.

## Installation

Clone this repository with [git](https://git-scm.com/):

```
git clone https://github.com/kurkku/slack-irc-bot.git
```

and install dependencies using [npm](http://github.com/isaacs/npm):

```
cd slack-irc-bot
npm install
```

Note: [node-irc](https://github.com/martynsmith/node-irc/) depends on a character-set detection library [icu](http://site.icu-project.org/). Your host must have libiconv and libicu installed in order to use this functionality -- otherwise you'll recieve errors when building these dependencies. However, node-irc will install and work fine -- without character-set functionality -- even though icu won't install correctly.

## Configuration

You must have a Slack bot token to be able to use Slack [Real Time Messaging API](https://api.slack.com/rtm). Create one at https://my.slack.com/services/new/bot for your team.

### Parameters
The bot is configured by editing following parameters in  [config/config.js](https://github.com/kurkku/slack-irc-bot/blob/master/config/config.js) file.

* ```slack.token```: Your Slack bot token
* ```slack.autoReconnect```: Should client reconnect upon disconnect
* ```slack.autoMark```: Should read messages be marked as read
* ```slack.channel```: Channel name that is replayed in IRC and where IRC messages are written to

* ```irc.server```: IRC server domain name
* ```irc.port```: IRC server port. If undefined, 6667 is used.
* ```irc.nick```: Nickname of the IRC bot
* ```irc.userName```: Username of the bot
* ```irc.realName```: Real name of the bot
* ```irc.localAddress```: Local address of your host (optional)
* ```irc.debug```: If enabled debug messages are written to console.
* ```irc.encoding```: Encoding which IRC messages are converted to. Slack expects UTF-8.
* ```irc.channel.name```: Name of the IRC channel
* ```irc.channel.protected```: Is the channel password-protected?
* ```irc.channel.password```: Password of the channel


