const util = require("util");
const irc = require("irc");
const _ = require("lodash");
const path = require("path");
const fs = require("fs");

const chanlog = require("./chanlog.js");
//var baseCommands = require("./commands/base.js");
//var duckduckCommands = require("./commands/duckduck.js");
//var commands = [baseCommands, duckduckCommands];

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

function InlineData (nick, origin, match, text, channelHistory) {
  this.nick = nick;
  this.origin = origin;
  this.match = match;
  this.text = text;
  this.channelHistory = channelHistory;
}

var default_options = {
  nick: 'Jigas',
  hostname: '10.0.0.69',
  port: 6667,
  floodProtection: true,
  channels: ["#jigas"],
  userName: "JigaS",
  realName: "Gigas JS IRC Bot",
  autoConnect: false,
  commands: ["base"],
  inlines: [],
  commandPaths: ["./", "./node_modules/jigas"]
};

function BaseBot (options) {
  var that = this;

  this.availableCommands = [];
  this.logger = new chanlog();

  this.opts = default_options;

  if (typeof options !== "undefined") {
    this.opts = default_options;
    _.forEach(Object.keys(options), function (opt) {
      this.opts[opt] = options[opt];
    }, this);
  }
  console.log("options: %s", util.inspect(this.opts));

  this.commands = [];
  this.inlines = [];

  this._autoRequire = function (partialPath, into) {
    _.forEach(this.opts.commandPaths, function (rel) {
      var fullPath = path.resolve(path.join(rel, partialPath));
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        try {
          into.push(require(fullPath));
        } catch (e) {
          console.log("Error loading %s: %s", fullPath, e);
        }
      }
    }, this);
  };

  this.findCommands = function () {
    //fixme: remove all listeners so it can be used to reload commands
    _.forEach(this.opts.commands, function (commandModule) {
      this._autoRequire(path.join("commands", commandModule + ".js"), this.commands);
    }, this);
  };

  this.findInlines = function () {
    //fixme: remove all listeners so it can be used to reload inlines
    _.forEach(this.opts.inlines, function (inlineModule) {
      this._autoRequire(path.join("inlines", inlineModule + ".js"), this.inlines);
    }, this);
  };


  this.client = new irc.Client(this.opts.hostname, this.opts.nick, this.opts);
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
      console.trace("Something tried to send an empty message to %s", to);
    } else {
      this.client.say(to, message);
    }
  };

  this.error = function (to, message) {
  };

  /*
   * Creates a function to make writing to a channel easier
   * Parameters:
   * - `to`: channel to which the bot will write to
   */
  this.genResponseFunction = function (to) {
    var bot = this;
    return function (error, result) {
      if (error) {
        console.log("Error: %s", error);
      }
      if (_.isEmpty(result) || result===false) {
        
        result = [];
      } else if (!Array.isArray(result)) {
        result = [result];
      }
      _.forEach(result, function (message) {
        bot.say(to, message);
      }, this);
    };
  };

  /*
   * React on any message
   */
  this.client.on("message",
                 function (nick, to, text, message) {
                   // does it start by the ! sign?
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
                           that.availableCommands);
                     }
                   } else { //log non-commands
                     that.logger.log(to, nick, text);
                     //run inlines so it can process them
                     // TODO: refactor to improve legibility (reduce?)
                     _.forEach(that.inlines, function (inline) {
                       if(inline.regexp.test(text)) {
                         var inlineData = new InlineData(nick, to, text.match(inline.regexp), message, that.logger.getChannel(to));
                         try {
                           // result should be either an string or an array of strings
                           // return empty or false to not trigger any action
                           result = inline.callback(that,inlineData);
                         } catch (e) {
                           that.say(to, "Something went wrong with the inline");
                           console.log("Error while processing the inline: %s", e);
                         }
                       }
                     }, that);
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

  this.loadCommands = function () {
    _.forEach(this.commands, function (command_list) {
      _.forEach(Object.keys(command_list), function (event) {
        this.loadCommand(event, command_list[event]);
        this.availableCommands.push(event);
      }, this);
    }, this);
  };

  this.reloadCommands = function () {
    _.forEach(this.availableCommands,
              function (command) {
                this.removeAllListeners(command);
              }, 
              this);
    this.availableCommands = new Array();
    this.loadCommands();
  };

  this.findCommands();
  this.findInlines();
  this.loadCommands();

}
util.inherits(BaseBot, process.EventEmitter);


function getCommand(text) {
  var command = text.match(/^!(\w+)\s*(.*)/);
  if (command != null) {
    return [command[1], command[2]];
  }
  return null;
}

module.exports.BaseBot = BaseBot;
module.exports.CommandData = CommandData;

