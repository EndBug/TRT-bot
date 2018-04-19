/*global client error getShortName roles*/
module.exports.name = "New member";
module.exports.run = () => {
  client.on("guildMemberAdd", (member) => {
    if (member.user.bot) {
      console.log(`<@${member.user.id}> added to the server.`);
    } else {
      console.log(`<@${member.user.id}> joined the server.`);
      member.addRole(roles.user).catch((e) => error("src/new_member.js", `on("guildMemberAdd")`, `Trying to add user role to ${getShortName(member.user)} returns \`${e}\``));
    }
  });
};