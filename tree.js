/*global fs goGlobal*/
module.exports.name = "Tree";

const tree = {
  "config.json": "./src/settings/config.private.json",
  "en-us.js": "./src/lang/en-us.js",
  "help.js": "./src/commands/help.js",
  "new_member.js": "./src/automation/new_member.js",
  "passwords.private.json": "./src/settings/passwords.private.json",
  "reloadme.json": "./src/misc/reloadme.json",
  "utils.js": "./src/misc/utils.js"
};

if (!fs.existsSync(absolutePath(tree["reloadme.json"]))) fs.writeFile(absolutePath(tree["reloadme.json"]), JSON.stringify({
  date: ""
}), (e) => {
  throw new Error(e);
});

function absolutePath(dir) {
  return __dirname + dir.slice(1);
}

function check(element = {}) {
  for (let dir of element.values()) {
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