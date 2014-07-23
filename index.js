
var basebot = require("./base_bot.js");

var bot = new basebot.BaseBot(
  '10.0.0.69',
  //'irc.freenode.net',
  'JigaS',
  {
    port: 6667,
    floodProtection: true,
    channels: ["#jigas"],
    userName: "JigaS",
    realName: "Gigas JS IRC Bot",
    autoConnect: false
  });
bot.connect();