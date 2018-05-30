/*global commands config createArgs mention randomInt tree*/

const fs = require("fs");
const Discord = require("discord.js");
const request = require("request");
const getID = require("get-youtube-id");
const getInfo = require("youtube-info");
const ytdl = require("ytdl-core");

const token = process.env[process.argv[2]];
const yt_api_key = process.env.YTKEY;
const client = new Discord.Client();
const TRTID = "330773448324415489";
var guild, owner;


var dispatcher = null,
  voiceChannel = null,
  playing = false,
  queue = [],
  waiting = null; //{id: "user id", items: []}

function goGlobal(obj) {
  for (let key in obj) global[key] = obj[key];
}

Discord.GuildMember.prototype.hasRole = function(role) {
  if (role instanceof Discord.Role)
    for (let r of this.roles.array())
      if (r == role) return true;
  return false;
};

function error(file, f, message, callback = () => {}) {
  owner.send(`**ERROR:**\n\`${file}\` > \`${f}\`\n*${message}*`).then(callback());
}

var ranks = {
  PLAYER: 0,
  STAFF: 1,
  ADMIN: 2,
  DEV: 3
};

var channels = {
  bot: {
    name: "botchat",
    id: "300600162235973632"
  }
};

var roles = {
  user: {
    name: "Players",
    id: "300593365773189120"
  },
  staff: {
    name: "Staff",
    id: "366294150880034837"
  },
  admin: {
    name: "Admins",
    id: "300592362005069825"
  },
  developer: {
    name: "Developers",
    id: "385532005640699915"
  }
};


goGlobal({
  Discord,
  fs,
  goGlobal,
  ranks
});

require("../../tree.js");

global.config = require(localPath(tree["config.json"]));

function localPath(str) {
  return str.replace("./src/", "../");
}

let lang = `${config.lang}.js`;
const say = require(localPath(tree[lang]));

const music_commands = require(localPath(tree["music_commands.js"]));
goGlobal({
  Command: music_commands.class,
  commands: music_commands.obj
});

function loadUtils() {
  let mod = require(localPath(tree["utils.js"]));
  goGlobal(mod.utils);
}

function initChannels() {
  for (let c in channels) {
    let curr = channels[c];
    let channel = guild.channels.find("name", curr.name);
    if (channel == undefined) {
      error("app.js", "initChannels", `Channel with name "${curr.name}" returns \`undefined\`, trying to use backup id.`);
      channel = guild.channels.get(curr.id);
      if (channel == undefined) {
        error("app.js", "initChannels", `Using fallback id "${curr.id}" returns \`undefined\`, stopping bot...`, () => {
          throw new Error(`Using fallback id "${curr.id}" returns \`undefined\`, stopping bot...`);
        });
      }
    }
    channels[c] = channel;
  }
}

function initRoles() {
  for (let r in roles) {
    let curr = roles[r];
    let role = guild.roles.find("name", curr.name);
    if (role == undefined) {
      error("app.js", "initRoles", `Role with name "${curr.name}" returns \`undefined\`, trying to use backup id.`);
      role = guild.roles.get(curr.id);
      if (role == undefined) {
        error("app.js", "initRoles", `Using fallback id "${curr.id}" returns \`undefined\`, stopping bot...`, () => {
          throw new Error(`Using fallback id "${curr.id}" returns \`undefined\`, stopping bot...`);
        });
      }
    }
    roles[r] = role;
  }
}

function checkCommand(str, getMode = false) {
  let c, found = false;
  for (let command of Object.values(commands))
    if (str.toLowerCase() == command.name) {
      c = command;
      found = true;
      break;
    }

  if (getMode) return c;
  else return found;
}

class Video {
  constructor(id) {
    this.id = id;
  }
}

function isLink(str = "") {
  return str.includes("youtube.com");
}

function search(query) {
  return new Promise((resolve, reject) => {
    request(`https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=${encodeURIComponent(query)}&key=${yt_api_key}`, (error, respose, body) => {
      let json = JSON.parse(body);
      if (error) reject(error);
      else resolve(json.items);
    });
  });
}

function joinMember(member) {
  return new Promise((resolve, reject) => {
    if (member instanceof Discord.GuildMember && member.voiceChannel != undefined) member.voiceChannel.join().then(() => {
      updateVoiceChannel();
      resolve();
    }).catch(e => reject(e));
    else if (member instanceof Discord.GuildMember) reject("member.voiceChannel is undefined");
    else reject("member is not a member");
  });
}

function addToQueue(id) {
  let curr = new Video(id);
  queue.push(curr);
}

function startPlaying() {
  if (queue.length > 0 && !playing) {
    play(queue[0]);
    queue.shift();
  }
}

function updateVoiceChannel(channel) {
  if (channel != undefined && channel instanceof Discord.VoiceChannel) voiceChannel = channel;
  else voiceChannel = guild.members.get(client.user.id).voiceChannel;
}

function play(video) {
  updateVoiceChannel();
  let id = video.id;
  voiceChannel.join().then(connection => {
    let stream = ytdl(`https://www.youtube.com/watch?v=${id}`, {
      filter: "audioonly"
    });

    dispatcher = connection.playStream(stream);
  });
}

client.login(token);

client.on("error", (e) => console.error(e));
client.on("warn", (w) => console.warn(w));
client.on("ready", () => {
  guild = client.guilds.array()[0];
  owner = guild.members.get(config.ids.owner);

  initRoles();
  initChannels();

  loadUtils();

  client.on("message", (message) => {
    let reply = (m) => message.channel.send(m);
    let args = createArgs(message),
      author = message.author,
      member,
      channel = message.channel;
    args.shift();
    if (waiting == null && ((author.bot && author.id == TRTID) || author.id == config.ids.owner) && channel == channels.bot && message.content.startsWith(mention(client.user))) {
      let issuerID = args[0];
      member = guild.members.get(issuerID);
      args.shift();
      let command = checkCommand(args[0], true);
      switch (command) {
        case commands.play:
          (() => {
            return new Promise((resolve, reject) => {
              if (playing) resolve();
              else if (member.voiceChannel != undefined) joinMember(member).then(resolve()).catch(e => reject(e));
              else {
                reply(say("err-no-voice"));
                resolve(false);
              }
            });
          })().then((response = true) => {
            if (response) {
              let query = args;
              console.log(query);
              query.shift();
              query.join(" ");
              if (isLink(query)) addToQueue(getID(query));
              else search(query).then(items => {
                let final = say("music-choose") + "```md\n";
                waiting = {
                  id: issuerID,
                  items: []
                };
                for (let i = 0; i < Math.min(5, items.length); i++) {
                  let curr = items[i];
                  waiting.items.push(curr.id.videoId);
                  getInfo(curr.id.videoId).then(info => {
                    final += `#${i+1} - [${info.duration}] ${info.title} (${info.owner})\n`;
                  });
                }
                final += "```";
                reply(final);
              });
            }
          }).catch(e => error("dj.js", "voiceChannel.join", e));
          break;
      }
      // message.delete();
    } else if (waiting != null && author.id == waiting.id && channel == channels.bot) {
      let num = parseInt(args[0]);
      if (isNaN(num)) reply(say("music-nan", args[0], waiting.items.length, randomInt(1, waiting.items.length)));
      else if (num < 1 || num > waiting.items.length) reply(say("music-range", args[0], waiting.items.length, randomInt(1, waiting.items.length)));
      else {
        let choice = waiting.items[num - 1];
        addToQueue(choice.id.videoId);
        if (!playing) startPlaying();
      }
    }
  });
});