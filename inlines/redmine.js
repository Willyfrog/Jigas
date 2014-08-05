const request = require('request');
const _ = require('lodash');
const util = require('util');

function getRedmineIssue(redmineHost, issueNumber, apiKey, callback) {
  var issue_url = redmineHost + "/issues/" + issueNumber + ".json";
  r = request({uri: issue_url, qs: {key: apiKey}, json: true},
              function (error, response, result) {
                if (error) {
                  callback(error);
                } else if (response.statusCode >= 400) {
                  callback("Redmine responded with an error [" + response.statusCode + "]: " + result,
                           "There was an error on the redmine server");
                } else {
                  var issue = result.issue;
                  var lines = ["----------[Redmine Issue]----------"];
                  try{
                    lines.push(issue.project.name + " > " + issue.tracker.name + " : " + issue.subject);
                    lines.push("Url: " + redmineHost + "/issues/" + issueNumber);
                    lines.push("Status: <" + issue.status.name + ">  Priority: <" + issue.priority.name + ">");
                  } catch (e) {
                    lines.push("Couldn't get the full details");
                    console.log("Error processing redmine issue #%s: %s", issueNumber, e);
                  }
                  lines.push("----------[#" + issueNumber + "]----------");
                  //console.log("lines are: %s", lines);
                  callback(null, lines);
                }
              });
};

function showRedmineIssue(bot, data) {
  //var message = "match: " + util.inspect(match);
  //  console.log(message);
  var issue = data.match[1];
  var redmineHost = bot.opts.redmineHost;
  var apiKey = bot.opts.redmineApiKey;
  var callback = bot.genResponseFunction(data.origin);
  //console.log("looking for #%s", issue);
  if (typeof redmineHost === "undefined"){
    callback("I don't have a hostname to look into redmine, please configure redmineHost value", []);
  } else if (typeof apiKey === "undefined"){
    callback("I don't have an api key to look into redmine, please configure redmineApiKey value", []);
  } else {
    getRedmineIssue(redmineHost, issue, apiKey, callback);
  }
}

module.exports.regexp = /#(\d+)/;
module.exports.callback = showRedmineIssue;
