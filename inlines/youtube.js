const request = require('request');
const _ = require('lodash');
const util = require('util');

function getYoutubeTitle(youtubeId, callback) {
  request({uri:"http://gdata.youtube.com/feeds/api/videos/" + youtubeId,
           qs:{"alt":"json", "v":2}},
          function (error, response, result) {
            var res = JSON.parse(result);
            if (error) {
              callback(error);
            } else if (response.statusCode >= 400) {
              callback("Youtube responded with an error [" + response.statusCode + "]: " + res,
                       "There was an error on the youtube server");
            } else {
              try {
                callback(null, "Video title: " + res["entry"]["title"]['$t']);
              } catch (e) {
                callback("There was an error with the response: " + e,
                         "There was an error with the response from the youtube server");
                callback(util.inspect(res["entry"]));
              }

            }
          });
}

module.exports.regexp = /youtu(be\.com\/.*v=([^&\.\ ]*)|\.be\/([^?\ \.]*))/;
module.exports.callback = function (bot, data) {
  getYoutubeTitle(data.match[2], bot.genResponseFunction(data.origin));
};
