const util = require("util");
const irc = require("irc");
const _ = require("lodash");

const chanlog = require("./chanlog.js");

var logger = new chanlog();

/*
 * Command Data
 * holds the information for a command with the command/text processed
 *  and also the original data from the irc lib
 * */
function CommandData (nick, origin, command, text, original) {
  this.nick = nick;
  this.origin = origin;
  this.command = command;
  this.text = text;
  this.original = original;
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
  this.hostname = hostname;
  this.nick = nick;
  if (typeof options === "undefined") {
    this.opts = default_options;
  } else {
    this.opts = options;
  }

  this.client = new irc.Client(hostname, nick, this.opts);
  //this.unregister_command
  this.client.on("error", function (data) {
    //forward errors if something is attached to error event
    if (process.EventEmitter.listenerCount(this, 'error')>0) {
      this.emit('error', data);
    } else {
      console.log("got an error here: " + util.inspect(data));
    }
  });

  var that = this;
  this.client.on("registered", function() {
    //initialize base commands upon connecting to the server
    _.forEach(Object.keys(baseCommands), function (event) {
      if (process.EventEmitter.listenerCount(that, event) == 0) // but only register it once
        that.on(event, baseCommands[event]);
      //console.log("%s: %s", event, process.EventEmitter.listenerCount(that, event));
    })
  });

  this.client.on("message",
                 function (nick, to, text, message) {
                   console.log("%s sent to %s: %s", nick, to, text);
                   var command = getCommand(text);
                   if (command != null) {
                     console.log("Got " + command[0] + " with msg " + command[1]);
                     //if (baseCommands.hasOwnProperty(command[0])){
                     console.log("this ", this);
                     if (process.EventEmitter.listenerCount(that, command[0])>0) {
                       //baseCommands[command[0]](client, new CommandData(nick, to, command[0], command[1], message));
                       that.emit(command[0], this, new CommandData(nick, to, command[0], command[1], message));
                     } else {
                       console.log("Invalid command %s", command[0]);
                       this.say(to, "Huh? I don't have that command. Valid commands are: " +
                           Object.keys(baseCommands));
                     }
                   } else { //log non-commands
                     logger.log(to, nick, text);
                   }
                 });

  this.connect = function () {
    this.client.connect(function() {console.log("connected");});
  }

  process.EventEmitter.call(this); // it's an Event Emmiter
}
util.inherits(BaseBot, process.EventEmitter);

var baseCommands = {
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
  },

  /* Simple echo */
  echo: function (client, command) {
    if (command.text.length > 0) {
      client.say(command.text);
    } else {
      client.say("What do you want me to say?");
    }

  },

  join: function (client, command) {
    console.log("join called with " + util.inspect(arguments));
    if (_.isEmpty(command.text.trim())) {
      client.say(command.to, "Which channel should I join?");
    } else {
      var channels = _.map(
        _.reject(command.text.split(),
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
  console: function () {
    _.forEach(arguments, function(item) {
      console.log("Argument: %s", util.inspect(item));
    });
  }
}

function makeChan(channame) {
  if (channame[0] != "#") {
    return "#" + channame;
  }
  return channame;
}

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