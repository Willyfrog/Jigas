const util = require("util");
const irc = require("irc");
const _ = require("lodash");


function makeChan(channame) {
  if (channame[0] != "#") {
    return "#" + channame;
  }
  return channame;
}

module.exports = {
    /* Hello world! */
    hola: function (bot, command) {
      var message;
      if (command.text.length > 0) {
        message = "Hello " + command.text;
      } else {
        message = "Hello there " + command.nick;
      }

      bot.client.notice(command.origin, message);
    },

  /* Repeat last messages on the channel */
  repeat: function (bot, command) {
    var limit, messages, linesRepeated;
    if (typeof command.channelHistory === "undefined" ||
        command.channelHistory.length === 0) {
      bot.say(command.origin, "There is no history for this channel");
      return 0;
    }
    if (command.text.length > 0) {
      limit = parseInt(command.text);
    }
    if (limit>0) {
      messages = command.channelHistory.get(command.origin, limit);
      linesRepeated = Math.min(command.channelHistory.length, limit);
    } else {
      messages = command.channelHistory.get(command.origin);
      linesRepeated = command.channelHistory.length;
    }

    _.forEach(messages, function (message) {
      bot.say(command.origin, message);
    });
    return linesRepeated;
  },

  /* Simple echo */
  echo: function (bot, command) {
    if (command.text.length > 0) {
      bot.say(command.origin, command.text);
    } else {
      bot.say(command.origin, "What do you want me to say?");
    }

  },

  join: function (bot, command) {
    var channelString = command.text.trim();
    if (_.isEmpty(channelString)) {
      bot.say(command.origin, "Which channel should I join?");

    } else {
      var channels = _.map(
        _.reject(channelString.split(),
                 function(item) {
                   return ((typeof item === "undefined") || (item === null) || _.isEmpty(item.trim()));
                 }),
        function (item) {
          return makeChan(item);
        });
      _.forEach(channels, function(channel) {
        bot.client.join(channel);
      });
    }
  },

  /*debug parameters received*/
  console: function (bot, command) {
    _.forEach(command, function(item) {
      console.log("Argument: %s", util.inspect(item));
    });
    bot.say(command.origin, "message logged");
  }
};
