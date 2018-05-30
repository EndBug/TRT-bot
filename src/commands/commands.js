/*global absolutePath channels client commands config createArgs Discord error getFullName guild maintenancePerm mention off rank ranks tree now owner roles say updateConfig writeJSON*/
module.exports.name = "Commands";

const help = require("./help.js");

function checkCommand(str, getMode = false, type = "all") {
  let c, found = false,
    all = false;
  if (type == "all") {
    all = true;
    type = "chat";
  }
  for (let command of Object.values(commands[type]))
    if (str.toLowerCase() == command.name) {
      c = command;
      found = true;
      break;
    }
  if (all && !found) {
    found = found || checkCommand(str, false, "music");
    if (found) c = checkCommand(str, true, "music");
  }
  if (getMode) return c;
  else return found;
}

function isDJ(id) {
  for (let curr of config.ids.djs)
    if (curr == id) return true;
  return false;
}

var blacklist = [];
var instant = ["!airhorn"];

function inBlack(message) {
  if (message instanceof Discord.Message)
    for (let e of blacklist)
      if (message.content.toLowerCase().includes(e)) return true;
  return false;
}

function inInsta(message) {
  if (message instanceof Discord.Message)
    for (let e of instant)
      if (message.content.toLowerCase().includes(e)) return true;
  return false;
}

global.localPath = (p = "") => {
  return `../../${p}`;
};

module.exports.run = () => {
  // client.on("commands-ready", () => {
  client.on("message", (message) => {
    let clean = (text) => {
        if (typeof text == "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else return text;
      },
      reply = (m, callback = () => {}) => {
        message.channel.send(m).then(callback());
      },
      args = createArgs(message),
      author = message.author,
      member = message.member,
      channel = message.channel;
    if (inBlack(message)) message.delete().then(channels.staff.send(say("moderation-required", mention(author), mention(channel))));
    else if (inInsta(message) || (checkCommand(args[0]) && channel != channels.bot)) message.delete(2500);
    else if ((config.maintenance && !maintenancePerm(member)) || channel != channels.bot || author.bot || !message.content.startsWith(config.p) || !checkCommand(args[0])) return;
    else {
      let command = checkCommand(args[0], true);
      if (rank(member) < command.rank || (command.hide && rank(member) != ranks.DEV)) reply(say("err-lack-of-perms", rank(member), command.rank));
      else if (checkCommand(command.name, false, "chat")) switch (command) {
        case commands.chat.dev:
          if (!config.maintenance) reply(say("maintenance-on"));
          else reply(say("maintenance-off"));
          config.maintenance = !config.maintenance;
          updateConfig();
          break;

        case commands.chat.eval:
          try {
            var silent = false,
              splice_n = 1;
            if (args[1] == "-s") {
              silent = true;
              splice_n++;
            }
            args.splice(0, splice_n);
            let code = args.join(" "),
              evaled = eval(code);
            if (typeof evaled != "string") evaled = require("util").inspect(evaled);
            if (!silent) message.channel.send(clean(evaled), {
              code: "xl"
            });
          } catch (err) {
            reply(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
          }
          break;

        case commands.chat.help:
          help(author, rank(member), commands.chat).then(reply, (e) => error("commands.js", "help", e));
          break;

        case commands.chat.info:
          reply(say("info-msg", mention(owner)));
          break;

        case commands.chat.invite:
          reply(say("invite-msg"));
          break;

        case commands.chat.off:
          console.log(say("bot-shutdown", getFullName(author)));
          reply(say("bot-shutting"), off);
          break;

        case commands.chat.ping:
          reply("pong!");
          break;

        case commands.chat.pref:
          if (args[1] != undefined) {
            config.p = args[1][0];
            reply(say("pref-change", config.p));
            updateConfig();
          } else reply(say("err-undef-arg"), "1");
          break;

        case commands.chat.reload:
          reply(say("bot-reloading"));
          console.log(say("bot-reloaded", getFullName(author)));
          writeJSON(absolutePath(tree["reloadme.json"]), {
            date: now()
          });
          break;

        case commands.chat.test:
          reply(`Debug test: \nRank: ${rank(message.member)} \nHasDev: ${member.hasRole(roles.developer)}`);
          break;
      } else {
        let vchannel = member.voiceChannel,
          id;
        if (vchannel != undefined)
          for (let m of vchannel.members.array()) {
            if (isDJ(m.id)) {
              id = m.id;
              break;
            }
          }
        if (vchannel == undefined) reply(say("err-no-voice"));
        else if (id == undefined) {
          if (command != commands.music.play && command.name != commands.music.join) reply(say("err-no-music", commands.music.play.name, commands.music.join.name));
          else {
            let member = undefined;
            for (let id of config.ids.djs) {
              let dj = guild.members.get(id);
              if (dj == undefined) error("commands.js", "assign-dj", "member is undefined");
              else if (dj.voiceChannel == undefined) {
                member = dj;
                break;
              }
            }
            if (member == undefined) reply(say("music-nodj"));
            else id = member.user.id;
          }
        }

        if (id != undefined) {
          let dj = guild.members.get(id);
          let str = `${mention(dj)}\n${author.id}\n${args.join(" ")}`;
          reply(str);
        }
      }
    }
  });
  // });
};
