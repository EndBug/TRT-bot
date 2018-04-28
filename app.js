/*global tree*/
const Discord = require("discord.js");
const http = require("http");
const fs = require("fs");

setInterval(function() {
  http.get("http://trt-bot.herokuapp.com");
}, 300000);

function goGlobal(obj) {
  for (let key in obj) global[key] = obj[key];
}

goGlobal({
  fs,
  goGlobal
});
require("./tree.js");

var say = require(tree[config.lang]);
//hard-coded message
if (say("test") != "ok") throw new Error(`Language module ${config.lang} not working properly: test command returned \`"${say("test")}"\` instead of \`"ok"\``);

client.login(token);

const modules = [
  tree["new_member.js"]
];

const token = require(tree["passwords.private.json"]).token;
const config = require(tree["config.json"]);
const client = new Discord.Client();
var guild, owner;

var channels = {
  general: "chat",
  staff: "staff",
  admin: "admins",
  bot: "botchat"
};

var roles = {
  user: "Players",
  staff: "Staff",
  admin: "Admins",
  developer: "Developers"
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

class Command {
  constructor(permission = ranks.PLAYER, name = "", syntax = "", description = "", hidden = false) {
    this.name = name;
    this.syn = syntax;
    this.des = description;
    this.rank = permission;
    this.hide = hidden;
  }
}

Discord.GuildMember.prototype.hasRole = (role) => {
  if (role instanceof Discord.Role)
    for (let r of this.roles.array())
      if (r == roles) return true;
  return false;
};

var ranks = {
  PLAYER: 0,
  STAFF: 1,
  ADMIN: 2,
  DEV: 3
};

var colors = {
  RED: 0xff1900,
  ORANGE: 0xFF8300,
  YELLOW: 0xebeb00,
  GREEN: 0x19eb00
};

var commands = {
  chat: {
    help: new Command(ranks.PLAYER, "help", "help", say("help-help")),
    info: new Command(ranks.PLAYER, "info", "info", say("info-help")),
    invite: new Command(ranks.PLAYER, "invite", "invite", say("invite-help")),
    // music: new Command(ranks.PLAYER, "music", "music", "Replies with helps infos for music.", true),
    ping: new Command(ranks.PLAYER, "ping", "ping", say("ping-help")),
    // mute: new Command(ranks.MOD, "mute", "mute <@User> <Days> <Reason>", "Mutes a user."),
    // unmute: new Command(ranks.MOD, "unmute", "unmute <@User> <Reason>", "Unmutes a user."),
    // warn: new Command(ranks.MOD, "warn", "warn <@User> <Reason>", "Warns a player."),
    // prune: new Command(ranks.ADMIN, "prune", "prune", "Prunes a channel."),
    // forgive: new Command(ranks.ADMIN, "forgive", "forgive <@User> <Reason>", "Deletes user's warns."),
    // kick: new Command(ranks.ADMIN, "kick", "kick <@User> <Reason>", "Kicks a player from the server."),
    // ban: new Command(ranks.ADMIN, "ban", "ban <@User> <Reason>", "Bans a player."),
    // unban: new Command(ranks.ADMIN, "unban", "unban <@User> <Reason>", "Unbans a player."),
    // softban: new Command(ranks.ADMIN, "softban", "softban <@User> <Days> <Reason>", "Bans a player for a defined time."),
    dev: new Command(ranks.DEV, "dev", "dev", say("dev-help")),
    eval: new Command(ranks.DEV, "eval", "eval <JS Script...>", say("eval-help")),
    off: new Command(ranks.DEV, "off", "off", say("off-help")),
    pref: new Command(ranks.DEV, "pref", "pref", say("pref-help", config.p)),
    reload: new Command(ranks.ADMIN, "reload", "reload", say("reload-help")),
    test: new Command(ranks.DEV, "test", "test", say("test-help"))
  },
  music: {
    // play: new Command(ranks.PLAYER, "play", "play <YouTube link || Search term>", "Adds a video (or livestream) to the queue. If you are in a voice channel the bot will join it, if the queue is empty it will automatically start playing.", true),
    // pause: new Command(ranks.PLAYER, "pause", "pause", "Pauses the stream.", true),
    // stop: new Command(ranks.PLAYER, "stop", "stop", "Stops the music and clears the queue.", true),
    // join: new Command(ranks.PLAYER, "join", "join", "Joins your voice channel.", true),
    // skip: new Command(ranks.PLAYER, "skip", "skip", "Skips current song.", true),
    // test: new Command(ranks.DEV, "mtest", "mtest", "Music test command")
  }
};



client.on("error", (e) => console.error(e));
client.on("warn", (w) => console.warn(w));
client.on("debug", (d) => console.info(d));
client.on("ready", () => {
  guild = client.guilds.array()[0];
  owner = guild.members.get(config.ids.owner);

  initChannels();
  initRoles();

  let to_global = Object.assign(
    ranks, {
      channels,
      client,
      colors,
      Command,
      commands,
      config,
      error,
      guild,
      owner,
      roles,
      say
    }
  );
  goGlobal(to_global);

  loadUtils();

  runModules();
});