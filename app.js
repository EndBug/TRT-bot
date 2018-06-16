/*global settings tree*/
const Discord = require("discord.js");
const fs = require("fs");
const GoogleSpreadsheet = require("google-spreadsheet");
const Twit = require("twit");
var branch = "master";
if (process.env.NODE_HOME != "/app/.heroku/node") branch = require("git-branch").sync(); //does not work in Heroku, but in Heroku only the master branch is deployed

const googles = {
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  sheet: process.env.GOOGLE_SHEET_KEY
};
const token = process.env.TOKEN;
const twitter_api_key = process.env.TWITTER_API_KEY;
const twitter_api_secret = process.env.TWITTER_API_SECRET;

function goGlobal(obj) {
  for (let key in obj) global[key] = obj[key];
}

goGlobal({
  branch,
  Discord,
  fs,
  GoogleSpreadsheet,
  googles,
  token,
  Twit,
  twitter_api_key,
  twitter_api_secret,
  goGlobal
});
loadMod("./tree.js");

const config = require(tree["config.json"]);
console.log(`[LOADER] Loaded config file`);
const client = new Discord.Client();
var guild, owner;

var say = require(tree[config.lang + ".js"]);
//hard-coded message
if (say("test") != "ok") throw new Error(`Language module ${config.lang} not working properly: test command returned \`"${say("test")}"\` instead of \`"ok"\``);
else console.log(`[LOADER] Using ${say("language")} language`);

client.login(token);

const modules = [
  tree["channel_cleaning.js"],
  tree["commands.js"],
  tree["new_member.js"],
  tree["reactions.js"],
  tree["role_request.js"],
  tree["status_rotation.js"],
  tree["twitter.js"]
];


var channels = {},
  roles = {},
  webhooks = {};

function error(file, f, message, callback = () => {}) {
  owner.send(`**ERROR:**\n\`${file}\` > \`${f}\`\n*${message}*`).then((m) => callback(m));
}
goGlobal({
  error
});

function initChannels() {
  return settings.get("channels").then((obj) => {
    console.log("[LOADER] Initializing channels...");
    for (let c in obj) {
      let id = obj[c];
      let channel = guild.channels.get(id);
      if (channel == undefined) {
        let err = `Using id "${id}" returns \`undefined\`, stopping bot...`;
        error("app.js", "initChannels", err, () => {
          throw new Error(err);
        });
      }
      channels[c] = channel;
    }
  }).catch((err) => {
    throw new Error(err);
  });
}

function initRoles() {
  return settings.get("roles").then((obj) => {
    console.log("[LOADER] Initializing roles...");
    for (let r in obj) {
      let id = obj[r];
      let role = guild.roles.get(id);
      if (role == undefined) {
        let err = `Using id "${id}" returns \`undefined\`, stopping bot...`;
        error("app.js", "initRoles", err, () => {
          throw new Error(err);
        });
      }
      roles[r] = role;
    }
  }).catch((err) => {
    throw new Error(err);
  });
}

function initWebhooks() {
  return new Promise((resolve, reject) => {
    console.log("[LOADER] Initializing webhooks...");
    guild.fetchWebhooks().then(ws => {
      settings.get("webhooks").then((obj) => {
        for (let w in obj) {
          let id = obj[w];
          let webhook = ws.get(id);
          if (webhook == undefined) {
            reject(`Using id "${id}" returns \`undefined\`, stopping bot...`);
          }
          webhooks[w] = webhook;
        }
        resolve();
      }).catch((err) => reject(err));
    });
  });
}

function loadMod(mod) {
  mod = require(mod);
  console.log(`[LOADER] Loaded ${mod.name}`);
  return mod;
}

function runModules(exept = []) {
  if (typeof exept != Object) exept = [exept];
  for (let mod of modules) {
    let l_mod = loadMod(mod);
    if (!exept.includes(mod) && !exept.includes(l_mod.name)) l_mod.run();
  }
}

function loadSettings() {
  let mod = loadMod(tree["settings.js"]);
  goGlobal({
    settings: mod
  });
  return mod.run();
}

function loadUtils() {
  let mod = loadMod(tree["utils.js"]);
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

Discord.GuildMember.prototype.hasRole = function(role) {
  return (role instanceof Discord.Role && this.roles.array().includes(role));
};

var ranks = {
  PLAYER: 0,
  STAFF: 1,
  ADMIN: 2,
  DEV: 3
};

var colors = {
  GREEN: 0x19eb00,
  ORANGE: 0xFF8300,
  PURPLE: 0x6500FF,
  RED: 0xff1900,
  YELLOW: 0xebeb00
};

var chars = {
  BLANK: "­"
};

var PresenceStatuses = {
  DND: "dnd",
  IDLE: "idle",
  INVISIBLE: "invisible",
  ONLINE: "online"
};

var ActivityTypes = {
  LISTENING: "WATCHING",
  PLAYING: "PLAYING",
  STREAMING: "STREMING",
  WATCHING: "WATCHING"
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
  guild.members.get(client.user.id).setNickname("");

  loadSettings().then(() => {
    initChannels().then(() => {
      initRoles().then(() => {
        initWebhooks().then(() => {
          let to_global = Object.assign(
            ranks,
            PresenceStatuses,
            ActivityTypes, {
              ActivityTypes,
              channels,
              chars,
              client,
              colors,
              Command,
              commands,
              config,
              guild,
              owner,
              PresenceStatuses,
              ranks,
              roles,
              say,
              webhooks
            }
          );
          goGlobal(to_global);

          loadUtils();

          runModules();

          owner.send(say("running")).then(m => m.delete(60000));
        }).catch((e, t = false) => {
          let f = () => {};
          if (t) f = () => {
            throw new Error(e);
          };
          error("app.js", "initWebhooks", e, f);
        });
      });
    });
  });
});