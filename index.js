var util = require("util");
var irc = require("irc");
const log_length = 20;

var client = new irc.Client(
  '10.0.0.69',
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
    var chan = command.origin;

  }

}

function Logger () {
  this.channels = {};
  this.log = function (channel, who, msg) {
    this.channels[channel].push("<" + who + "> " + msg);
    if (this.channels[channel].length > log_length) {
      this.channels[channel].shift(); //remove the first one
    }
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
            console.log("%s send to %s: %s", nick, to, text);
            var command = getCommand(text);
            if (command != null) {
              console.log("Got " + command[0] + " with msg " + command[1]);
              if (command_functions.hasOwnProperty(command[0])){
                command_functions[command[0]](client, new CommandData(nick, to, command[0], command[1], message));
              } else {
                client.say(to, "Huh? I don't have that command. Valid commands are: " +
                           Object.keys(command_functions));
              }
            }
          });

client.on("error", function (data) {
  console.log("got an error here: " + util.inspect(data));
})

client.connect(function() {
  console.log("connected");
});