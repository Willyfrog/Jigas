const util = require("util");
const irc = require("irc");
const _ = require("lodash");

const chanlog = require("./chanlog.js");

var logger = new chanlog();

var client = new irc.Client(
  //'10.0.0.69',
  'irc.freenode.net',
  'JigaS',
  {
    port: 6667,
    floodProtection: true,
    channels: ["#jigas"],
    userName: "jigas",
    realName: "Gigas JS IRC Bot",
    autoConnect: false

  });

var command_functions = {
    hola: function (client, command) {
      var message;
      if (command.text.length > 0) {
        message = "Hello " + command.text;
      } else {
        message = "Hello there " + command.nick;
      }

      client.notice(command.origin, message);
    },

  repeat: function (client, command) {
    var limit, messages;
    if (command.text.length > 0) {
      limit = parseInt(command.text);
    }
    if (limit>0) {
      messages = logger.get(command.origin, limit);
    } else {
      messages = logger.get(command.origin);
    }
    
    _.forEach(messages, function (message) {
      client.say(command.origin, message);
    });

  }

}

function CommandData (nick, origin, command, text, original) {
  this.nick = nick;
  this.origin = origin;
  this.command = command;
  this.text = text;
  this.original = original;
}

function getCommand(text) {
  var command = text.match(/!(\w+)\s*(.*)/);
  if (command != null) {
    return [command[1], command[2]];
  }
  return null;
}

client.on("message",
          function (nick, to, text, message) {
            console.log("%s sent to %s: %s", nick, to, text);
            var command = getCommand(text);
            if (command != null) {
              console.log("Got " + command[0] + " with msg " + command[1]);
              if (command_functions.hasOwnProperty(command[0])){
                command_functions[command[0]](client, new CommandData(nick, to, command[0], command[1], message));
              } else {
                client.say(to, "Huh? I don't have that command. Valid commands are: " +
                           Object.keys(command_functions));
              }
            } else { //log non-commands
              logger.log(to, nick, text);
            }
          });

client.on("error", function (data) {
  console.log("got an error here: " + util.inspect(data));
})

client.connect(function() {
  console.log("connected");
});