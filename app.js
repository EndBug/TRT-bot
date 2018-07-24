/*global absolutePath config mention say settings tree*/
const Discord = require("discord.js");
const Commando = require("discord.js-commando");
global.Command = Commando.Command;
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

global.answer = (msg, def, mention = false, args = []) => {
  if (msg instanceof Commando.CommandMessage) {
    let text = say(def, args);
    if (mention) return msg.reply(text);
    else return msg.say(text);
  } else error("app.js", "answer", "msg is not a CommandMessage");
};

goGlobal({
  branch,
  Commando,
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

var client, guild, owner;


const modules = [
  tree["channel_cleaning.js"],
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

async function initClient() {
  await loadSettings();
  await settings.get("config").then(obj => {
    global.config = obj;
    config.clean = eval(obj.clean);
    config.maintenance = eval(obj.maintenance.toLowerCase());
    config.status = eval(obj.status);
    global.say = require(tree[config.lang + ".js"]);
    //hard-coded message
    if (say("test") != "ok") throw new Error(`Language module ${config.lang} not working properly: test command returned \`"${say("test")}"\` instead of \`"ok"\``);
    else console.log(`[LOADER] Using ${say("language")} language`);
    client = new Commando.Client({
      commandPrefix: config.p,
      disableEveryone: true,
      owner: config.owner,
      unknownCommandResponse: false
    });

    client.on("error", console.error)
      .on("warn", console.warn)
      .on("debug", console.log);

    client.registry.registerGroups([
        ["dev", "Development & debugging"],
        ["misc", "Various"],
        ["mod", "Moderation"],
        ["music", "Music"]
      ]).registerDefaultGroups()
      .registerDefaultTypes()
      .registerCommandsIn(absolutePath(tree["commands"]));
  });
}

function setInhibitors() {
  client.dispatcher.addInhibitor(msg => {
    try {
      if (msg.channel != channels.bot && !(msg.channel instanceof Discord.DMChannel)) {
        msg.delete();
        if (msg.author != owner) {
          msg.respond("ignored-cmd", mention(channels.bot)).then(m => m.delete(5000));
          return true;
        } else return false;
      } else if (msg.channel instanceof Discord.DMChannel) {
        if (msg.command != undefined) return (msg.command.name != "help");
        else return true;
      }
      return false;
    } catch (e) {
      error("app.js", "inhibitor", e);
    }
  });
}

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
  }).catch((e, t = false) => {
    let f = () => {};
    if (t) f = () => {
      throw new Error(e);
    };
    error("app.js", "initWebhooks", e, f);
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

(async () => {
  await initClient();
  client.on("ready", async () => {
    guild = client.guilds.get(config.guild);
    owner = guild.members.get(config.owner);
    guild.members.get(client.user.id).setNickname("");

    await loadSettings();
    await initChannels();
    await initRoles();
    await initWebhooks();
    let to_global = Object.assign(
      ranks,
      PresenceStatuses,
      ActivityTypes, {
        ActivityTypes,
        channels,
        chars,
        client,
        colors,
        config,
        guild,
        owner,
        PresenceStatuses,
        ranks,
        roles,
        webhooks
      }
    );
    goGlobal(to_global);

    loadUtils();

    setInhibitors();

    runModules();

    owner.send(say("running")).then(m => m.delete(5000));
  });
  client.login(token);
})();