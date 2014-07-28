const util = require("util");

function ArrayLog(logLength) {
  this.logLength = logLength;
  Array.apply(this,
              Array.prototype.slice.call(arguments, 1));
  /*
   * function for easing the getting of a channel's history
   * */
  this.get = function (limit) {
    var max = (typeof limit !== "undefined" ? limit : this.logLength);
    return this.slice(-max, this.length);
  };
  /*
   * function for logging what a user said
   * */
  this.log = function (who, msg) {
    this.push("<" + who + "> " + msg);

    if (this.length > this.logLength) {
      this.shift(); //remove the first one
    }
    return this.length;
  };
}
util.inherits(ArrayLog, Array);

function ChannelLogger (logLength) {

  this.logLength = (typeof logLength !== "undefined" ? logLength : 20);
  this.channels = {};

  this.log = function (channel, who, msg) {
    if (typeof this.channels[channel] === "undefined") {
      this.channels[channel] = new ArrayLog(this.logLength);
    }
    return this.channels[channel].log(who, msg);
  },

  this.get = function (channel, limit) {
    return this.channels[channel].get(limit);
  };

  this.getChannel = function (channel) {
    return this.channels[channel];
  };
}

module.exports = ChannelLogger;