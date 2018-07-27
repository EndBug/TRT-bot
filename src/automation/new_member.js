/*global channels client error getFullName getShortName guild mention roles say*/
module.exports.name = "New member";
module.exports.run = () => {
  client.on("guildMemberAdd", (member) => {
    if (member.guild != guild) return;

    if (member.user.bot) {
      console.log(`<@${getFullName(member.user.id)}> added to the server.`);
    } else {
      console.log(`<@${getFullName(member.user.id)}> joined the server.`);
      channels.general.send(say("welcome", mention(member), mention(channels.rules), mention(channels.bot)));
      member.addRole(roles.user).catch((e) => error("src/new_member.js", `on("guildMemberAdd")`, `Trying to add user role to ${getShortName(member.user)} returns \`${e}\``));
    }
  });
};