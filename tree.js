/*global fs goGlobal*/
module.exports.name = "Tree";

const tree = {
  "config.json": "./src/settings/config.json",
  "new_member.js": "./src/automation/new_member.js",
  "passwords.private.json": "./src/settings/passwords.private.json",
  "utils.js": "./src/misc/utils.js"
};

function check(element = {}) {
  for (let dir of element) {
    let path = __dirname + dir.slice(1);
    if (!fs.existsSync(path)) throw new Error(`\`${path}\` does not exist. If you believe it's an error, check if the tree in \`tree.js\` is updated`);
  }
}

check(tree);

goGlobal({
  tree
});