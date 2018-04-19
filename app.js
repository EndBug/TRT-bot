/*global tree*/
const Discord = require("discord.js");
const fs = require("fs");

function goGlobal(obj) {
  for (let key in obj) global[key] = obj[key];
}

goGlobal({
  fs,
  goGlobal
});
require("./tree.js");

client.login(token);

const modules = [
  tree["new_member.js"]
];

const token = require(tree["passwords.private.json"]).token;
const client = new Discord.Client();
var guild, owner;

var channels = {
  general: "chat"
};

var roles = {
  user: "Players"
};

function error(file, f, message) {
  owner.send(`**ERROR:**\n\`${file}\` > \`${f}\`\n*${message}*`);
}

function initChannels() {
  for (let c in channels) {
    let name = channels[c];
    let channel = guild.channels.find("name", name);
    if (channel == undefined) error("app.js", "initChannels", `Channel "${name}" returns \`undefined\``);
    channels[c] = channel;
  }
}

function initRoles() {
  for (let r in roles) {
    let name = roles[r];
    let role = guild.roles.find("name", name);
    if (role == undefined) error("app.js", "initRoles", `Role "${name}" returns \`undefined\``);
    roles[r] = role;
  }
}

function runModules(exept = []) {
  if (typeof exept != Object) exept = [exept];
  for (let mod of modules) {
    let l_mod = require(mod);
    if (!exept.includes(mod) && !exept.includes(l_mod.name)) l_mod.run();
  }
}

function loadUtils() {
  let mod = require(tree["utils.js"]);
  goGlobal(mod.utils);
}


client.on("error", (e) => console.error(e));
client.on("warn", (w) => console.warn(w));
client.on("debug", (d) => console.info(d));
client.on("ready", () => {
  guild = client.guilds.array()[0];
  owner = guild.members.get("218308478580555777");

  initChannels();
  initRoles();

  goGlobal({
    channels,
    client,
    error,
    guild,
    owner,
    roles
  });

  loadUtils();

  runModules();
});