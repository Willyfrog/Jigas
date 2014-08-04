const request = require('request');
const _ = require('lodash');
const util = require('util');

function getRedmineIssue(bot, match) {
  console.log("match: %s", util.inspect(match));
}

module.exports.inline = /#(\d+)/;
module.exports.callback = getRedmineIssue;
