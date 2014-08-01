const config = require("./config.js");
var basebot = require("./base_bot.js");

/*
 * this file acts as a working example for configuring
 * and running the bot in a simple way
 *
 * For most people, running it once to create the config
 * file and modifying it, should be more than enough
 */


/*
 * Create the bot and connect to it
 */
var bot = new basebot.BaseBot(config('./jigas-config.json'));
bot.connect();