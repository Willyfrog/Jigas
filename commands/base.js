const util = require("util");
const irc = require("irc");
const _ = require("lodash");


module.exports = {
    /* Hello world! */
    hola: function (client, command) {
      var message;
      if (command.text.length > 0) {
        message = "Hello " + command.text;
      } else {
        message = "Hello there " + command.nick;
      }

      client.notice(command.origin, message);
    },

  /* Repeat last messages on the channel */
  repeat: function (client, command) {
    var limit, messages, linesRepeated;
    if (typeof command.channelHistory === "undefined" ||
        command.channelHistory.length === 0) {
      client.say(command.origin, "There is no history for this channel");
      return 0
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
      client.say(command.origin, message);
    });
    return linesRepeated;
  },

  /* Simple echo */
  echo: function (client, command) {
    if (command.text.length > 0) {
      client.say(command.origin, command.text);
    } else {
      client.say(command.origin, "What do you want me to say?");
    }

  },

  join: function (client, command) {
    var channelString = command.text.trim();
    if (_.isEmpty(channelString)) {
      client.say(command.origin, "Which channel should I join?");

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
        client.join(channel);
      });
    }
  },

  /*debug parameters received*/
  console: function (client, command) {
    _.forEach(command, function(item) {
      console.log("Argument: %s", util.inspect(item));
    });
    client.say(command.origin, "message logged");
  }
}