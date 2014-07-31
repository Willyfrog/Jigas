const request = require('request');
const _ = require('lodash');
const util = require('util');

const dd_url = "http://api.duckduckgo.com";

module.exports = {
  duckduck: function (bot, command) {
    if (_.isEmpty(command.text)) {
      bot.say("What do you want to search?");
    } else {
      var query = {q:command.text.split().join('+'), format:"json", t:"IRC Bot"},
          had_result = false;
      console.log("Asking ddg with query %s", query.q);
      
      request({uri: dd_url, qs: query, json: true}, function (error, response, result) {
        if (error) {
          bot.say(command.to, "Sorry, but duckduckgo gave me an error: " + error);
        }
        if (response.status >= 400) {
          bot.say(command.to, "Sorry, but duckduckgo gave me an error " + response.status);
        }
        console.log("got result: %s", util.inspect(result));
        if (typeof result.AbstractText !== "undefined") {
          bot.say(command.to, "Duckduck said: " + result.AbstractText);
          had_result = true;
        }
        if (typeof result.AbstractUrl !== "undefined") {
          bot.say(command.to, "Url: " + result.AbstractUrl);
          had_result = true;
        } 
        if (!had_result){
          bot.say(command.to, "No instant result found");
        }

        _.forEach(result.RelatedTopics, function (related) {
          bot.say("Related: " + related.Text + " => " + related.FirstURL);
        });
      });
    }
  }
};
