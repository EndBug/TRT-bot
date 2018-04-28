/*global colors config Discord owner rankToString ranks say*/
function getCommands(rank, all_commands) {
  let result = [];
  for (let c of all_commands.values())
    if (rank >= c.rank(!c.hide || rank == ranks.DEV)) result.push(c);
  return result;
}

module.exports = (user, rank, all_commands) => {
  return new Promise((resolve, reject) => {
    try {
      if (user instanceof Discord.User && !isNaN(rank) && typeof all_commands == Object) {
        let embeds = [],
          display = getCommands(rank, all_commands),
          n = Math.floor(display.length / 25 - 0.01);
        for (let i = 0; i <= n; i++) {
          let temp = new Discord.RichEmbed()
            .setAuthor(say("help-author", rankToString(rank)), owner.avatarURL)
            .setColor(colors.ORANGE)
            .setTimestamp();
          if (n == 0) temp.setFooter(say("help-onepage"));
          else temp.setFooter(say("help-morepages", i + 1, n + 1));
          let size;
          if (i == n) size = display.length % 25;
          else size = 25;
          for (let j = 0; j < size; j++) {
            let curr = display[i * 25 + j];
            let f_syn = say("help-comingsoon"),
              hidden = "";
            if (curr.hide) hidden = " (hidden)";
            if (curr.syn != "") f_syn = config.p + curr.syn + hidden;
            temp.addField(`${config.p}${curr.name} → \`${f_syn}\``, curr.des);
          }
          embeds.push(temp);
        }
        for (let i = 0; i < embeds.length; i++) {
          user.send({
            embed: embeds[i]
          }).then(() => {
            //hard-coded message
            if (i == embeds.length - 1) resolve(say("help-success"));
          });
        } //hard-coded message
      } else reject(`isUser? ${user instanceof Discord.User} - Rank? ${rank} - Commands? ${typeof all_commands == Object}`);
    } catch (e) {
      reject(e);
    }
  });
};