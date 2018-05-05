/*global absolutePath channels client commands config createArgs Discord error getFullName maintenancePerm mention off rank ranks tree now owner roles say updateConfig writeJSON*/
module.exports.name = "Commands";

const help = require("./help.js");

function checkCommand(str, getMode = false) {
  let c, found = false;
  for (let command of Object.values(commands.chat))
    if (str.toLowerCase() == command.name) {
      c = command;
      found = true;
      break;
    }

  if (getMode) return c;
  else return found;
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
    else if (inInsta(message)) message.delete(5000);
    else if ((config.maintenance && !maintenancePerm(member)) || channel != channels.bot || author.bot || !message.content.startsWith(config.p) || !checkCommand(args[0])) return;
    else {
      let command = checkCommand(args[0], true);
      if (rank(member) < command.rank || (command.hide && rank(member) != ranks.DEV)) reply(say("err-lack-of-perms", rank(member), command.rank));
      else switch (command) {
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
      }
    }
  });
  // });
};