const request = require('request');
const _ = require('lodash');
const util = require('util');

const dd_url = "http://api.duckduckgo.com";

module.exports = {
  duckduck: function (bot, command) {
    if (_.isEmpty(command.text)) {
      bot.say(command.origin, "What do you want to search?");
    } else {
      var query = {q:command.text.split().join('+'), format:"json", t:"IRC Bot"},
          had_result = false;
      //console.log("Asking ddg with query %s", query.q);
      
      request({uri: dd_url, qs: query, json: true}, function (error, response, result) {
        if (error) {
          bot.say(command.origin, "Sorry, but duckduckgo gave me an error: " + error);
        }
        if (response.status >= 400) {
          bot.say(command.origin, "Sorry, but duckduckgo gave me an error " + response.status);
        }
        //console.log("got result: %s", util.inspect(result));
        if (typeof result.AbstractText !== "undefined" && !_.isEmpty(result.AbstractText)) {
          bot.say(command.origin, "Duckduck said: " + result.AbstractText);
          had_result = true;
        }
        if (typeof result.AbstractUrl !== "undefined" && !_.isEmpty(result.AbstractUrl)) {
          bot.say(command.origin, "Url: " + result.AbstractUrl);
          had_result = true;
        } 
        if (!had_result){
          bot.say(command.origin, "No instant result found");
        }

        _.forEach(result.RelatedTopics, function (related) {
          if (!_.isEmpty(related.Text)) {
            bot.say(command.origin, "Related: " + related.Text + " => " + related.FirstURL);
          }
        });
      });
    }
  }
};
