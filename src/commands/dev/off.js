/*global checkRank Commando off rank ranks say*/

module.exports = class OffCMD extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "off",
      aliases: ["bye", "shutdown", "sleep"],
      group: "dev",
      memberName: "off",
      description: say("off-help")
    });
  }

  async run(msg) {
    console.log(say("bot-shutdown"));
    await msg.answer("bot-shutting");
    off();
  }

  hasPermission(msg) {
    if (!checkRank(msg.author, ranks.DEV)) return say("err-lack-of-perms", rank(msg.author), ranks.DEV);
    else return true;
  }
};