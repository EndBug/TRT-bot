/*global channels client colors Discord error guild owner say settings userToMember*/
module.exports.name = "Role request";

class Game {
  constructor(rid = "", eid = "") {
    let r = guild.roles.get(rid),
      e = guild.emojis.get(eid);
    if (eid.length < 18) e = eid;
    if (r == undefined || e == undefined) this.invalid = true;
    else {
      this.name = r.name;
      this.emoji = e;
      this.people = 0;
      this.role = r;

      this.updatePeople();
    }
  }

  updatePeople() {
    let count = 0;
    guild.members.forEach((member) => {
      if (member.hasRole(this.role)) count++;
    });
    this.people = count;
  }
}

var games = [];
var channel = channels.games;

function createMessage() {
  let embed = new Discord.RichEmbed()
    .setColor(colors.ORANGE)
    .setTimestamp()
    .setFooter("Made by EndBug", owner.user.displayAvatarURL)
    .setAuthor(say("game-author"), "https://imgur.com/omgbGo1.png");
  let value1 = "",
    value2 = "";
  for (let i = 0; i < games.length; i++) {
    let game = games[i],
      str = `\n${game.emoji} → ${game.name} - ${game.people} user${game.people > 1 ? "s" : ""}`;
    if (i < games.length / 2) value1 += str;
    else value2 += str;
  }
  embed.addField(say("game-msg"), value1, true).addField(say("game-no", games.length), value2, true);
  return embed;
}

function sortGames() {
  games.sort((a, b) => {
    let p = b.people - a.people;
    if (p == 0) return a.name - b.name;
    else return p;
  });
}

function findGame(emoji) {
  for (let game of games) {
    if (game.emoji == emoji) return game;
  }
}

function updateMessage(id) {
  for (let game of games) game.updatePeople();
  channel.fetchMessage(id).then(msg => {
    if (msg != undefined) msg.edit(createMessage());
    else channel.send("Rebuilding...").then(nmsg => nmsg.edit(createMessage()));
  });
}

module.exports.run = () => {
  channel.fetchMessages({
    limit: 100
  }).then(messages => {
    messages.forEach(msg => {
      if (msg.author != client.user) msg.delete();
    });
  });

  settings.get("games").then(obj => {
    for (let rid in obj) {
      let eid = obj[rid];
      let curr = new Game(rid, eid);
      if (curr.invalid) error("role_request.js", "Game/constructor", `Skipping undefined game:\nRole: \`${rid}\`\nEmoji: \`${eid}\``);
      else games.push(curr);
    }
    sortGames();

    settings.get("messages").then(obj => {
      let id = obj.games;
      new Promise((resolve) => {
        if (id == undefined) channel.send(say("game-build")).then(msg => {
          id = msg.id;
          resolve();
        });
        else resolve();
      }).then(() => {
        if (id != obj.games) settings.set("messages", {
          games: id
        });

        channel.fetchMessage(id).then(msg => {
          msg.edit(createMessage());
          msg.clearReactions().then(() => {
            let c = 0;
            let go = () => msg.react(games[c].emoji).then(() => {
              c++;
              if (c < games.length) go();
            });
            go();
          });
        });

        client.on("messageReactionAdd", (reaction, user) => {
          if (reaction.message.id != id || user == client.user) return;
          let game = findGame(reaction.emoji),
            member = userToMember(user),
            embed = new Discord.RichEmbed()
            .setTimestamp()
            .setAuthor(user.username, user.displayAvatarURL);
          if (game != undefined) {
            if (member.hasRole(game.role)) {
              member.removeRole(game.role).then(() => updateMessage(id));
              embed.addField(say("game-rem"), `- ${game.name}`);
              embed.setColor(colors.RED);
            } else {
              member.addRole(game.role).then(() => updateMessage(id));
              embed.addField(say("game-add"), `+ ${game.name}`);
              embed.setColor(colors.GREEN);
            }
            channel.send(embed);
          }
          reaction.remove(user);
        });

        client.on("message", message => {
          if (message.channel == channel) message.delete(5000);
        });
      });
    });
  });
};