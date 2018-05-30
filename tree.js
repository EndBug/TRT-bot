/*global fs goGlobal*/
module.exports.name = "Tree";

const tree = {
  "channel_cleaning.js": "./src/automation/channel_cleaning.js",
  "commands.js": "./src/commands/commands.js",
  "config.json": "./src/settings/config.json",
  "en-us.js": "./src/lang/en-us.js",
  "help.js": "./src/commands/help.js",
  "music_commands.js": "./src/music/music_commands.js",
  "new_member.js": "./src/automation/new_member.js",
  "reactions.js": "./src/automation/reactions.js",
  "reloadme.json": "./src/misc/reloadme.json",
  "status_rotation.js": "./src/automation/status_rotation.js",
  "twitter.js": "./src/webhooks/twitter.js",
  "utils.js": "./src/misc/utils.js"
};

if (!fs.existsSync(absolutePath(tree["reloadme.json"]))) fs.writeFile(absolutePath(tree["reloadme.json"]), JSON.stringify({
  date: ""
}), (e) => {
  if (e != null) throw new Error(e);
});

function absolutePath(dir) {
  return __dirname + dir.slice(1);
}

function check(element = {}) {
  for (let dir of Object.values(element)) {
    let path = absolutePath(dir);
    //hard-coded message
    if (!fs.existsSync(path)) throw new Error(`\`${path}\` does not exist. If you believe it's an error, check if the tree in \`tree.js\` is updated`);
  }
}

check(tree);

goGlobal({
  absolutePath,
  tree
});
