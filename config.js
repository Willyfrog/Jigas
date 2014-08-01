const fs = require("fs");

/*
 * Get the options for configuring the bot,
 * if file is not found, creates it with some defaults
 * Parameters:
 * - `path`: file path
 */
function getConfigSync(path) {
  var options;

  if (fs.existsSync(path) && fs.statSync(path).isFile()) {
    options = JSON.parse(fs.readFileSync(path, {encoding: 'utf8'}));
  } else {
    options = {hostname: '10.0.0.69',
               nick:'JigaS',
               port: 6667,
               floodProtection: true,
               channels: ["#jigas"],
               userName: "JigaS",
               realName: "Gigas JS IRC Bot",
               autoConnect: false
              };
    fs.writeFileSync(path, JSON.stringify(options), {encoding: 'utf8'});
  }
  return options;
}

module.exports = getConfigSync;