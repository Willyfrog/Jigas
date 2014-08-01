const util = require("util");
const irc = require("irc");
const _ = require("lodash");

const chanlog = require("./chanlog.js");
var baseCommands = require("./commands/base.js");
var duckduckCommands = require("./commands/duckduck.js");
var commands = [baseCommands, duckduckCommands];

/*
 * Command Data
 * holds the information for a command with the command/text processed
 *  and also the original data from the irc lib
 * */
function CommandData (nick, origin, command, text, original, channelHistory) {
  this.nick = nick;
  this.origin = origin;
  this.command = command;
  this.text = text;
  this.original = original;
  this.channelHistory = channelHistory;
}

var default_options = {
  port: 6667,
  floodProtection: true,
  channels: ["#jigas"],
  userName: "JigaS",
  realName: "Gigas JS IRC Bot",
  autoConnect: false
};

function BaseBot (hostname, nick, options) {
  var that = this;

  this.hostname = hostname;
  this.nick = nick;
  this.availableCommands = [];
  this.logger = new chanlog();

  if (typeof options === "undefined") {
    this.opts = default_options;
  } else {
    this.opts = options;
  }

  this.client = new irc.Client(hostname, nick, this.opts);
  process.EventEmitter.call(this); // it's an Event Emmiter

  this.client.on("error", function (data) {
    //forward errors if something is attached to error event
    if (process.EventEmitter.listenerCount(this, 'error')>0) {
      this.emit('error', data);
    } else {
      console.log("got an error here: " + util.inspect(data));
    }
  });

  /* convenience function */
  this.say = function (to, message) {
    if (typeof to === "undefined") {
      console.log("Something tried to send a message to an empty channel. message was: %s", message);
    }
    if (_.isEmpty(message)) {
      console.log("Something tried to send an empty message to %s", to);
    } else {
      this.client.say(to, message);
    }
  };

  // load commands and inlines on connection
  this.client.on("registered", function() {
    //initialize base commands
  });

  this.client.on("message",
                 function (nick, to, text, message) {
                   var command = getCommand(text);
                   if (command != null) {
                     console.log("Got " + command[0] + " with msg " + command[1]);
                     if (process.EventEmitter.listenerCount(that, command[0])>0) {
                       //baseCommands[command[0]](client, new CommandData(nick, to, command[0], command[1], message));
                       that.emit(command[0],
                                 that,
                                 new CommandData(nick, to, command[0], command[1], message, that.logger.getChannel(to)));
                     } else {
                       that.client.say(to, "Huh? I don't have that command. Valid commands are: " +
                           Object.keys(that.availableCommands));
                     }
                   } else { //log non-commands
                     that.logger.log(to, nick, text);
                   }
                 });

  this.connect = function () {
    this.client.connect(function() {
      console.log("connected");
    });
  };

  this.loadCommand = function (command, callback) {
    this.on(command, callback);
    console.log("Loaded %s", command);
  };

  _.forEach(commands, function (command_list) {
    _.forEach(Object.keys(command_list), function (event) {
      this.loadCommand(event, command_list[event]);
      this.availableCommands.push(event);
    }, this);
  }, this);

}
util.inherits(BaseBot, process.EventEmitter);


function getCommand(text) {
  var command = text.match(/!(\w+)\s*(.*)/);
  if (command != null) {
    return [command[1], command[2]];
  }
  return null;
}

module.exports.BaseBot = BaseBot;
module.exports.CommandData = CommandData;
module.exports.baseCommands = baseCommands;
