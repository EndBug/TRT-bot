/*global client*/

module.exports.name = "Reactions control";
module.exports.run = (avoidself = true) => {
  client.on("messageReactionAdd", (reaction, user) => {
    for (let r of reaction.message.reactions.array()) {
      if (r != reaction && (user != client.user || (user == client.user && !avoidself)) && r.users.array().includes(user)) r.remove(user);
    }
  });
};