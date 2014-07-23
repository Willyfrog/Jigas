function ChannelLogger (log_length) {

  this.log_length = (typeof log_length !== "undefined" ? log_length : 20);
  this.channels = {};

  this.log = function (channel, who, msg) {
    if (typeof this.channels[channel] === "undefined") {
      this.channels[channel] = new Array();
    }
    this.channels[channel].push("<" + who + "> " + msg);

    if (this.channels[channel].length > this.log_length) {
      this.channels[channel].shift(); //remove the first one
    }
  },

  this.get = function (channel, limit) {
    var max = (typeof limit !== "undefined" ? limit : this.log_length);
    var chan = this.channels[channel];
    return chan.slice(-max, chan.length);
  }
}

module.exports = ChannelLogger;