/*global absolutePath answer checkRank Commando getFullName now rank ranks say tree writeJSON*/

module.exports = class RestartCMD extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "restart",
      aliases: ["reboot", "rs"],
      group: "dev",
      memberName: "restart",
      description: say("restart-help")
    });
  }

  async run(msg) {
    console.log(say("bot-restarted", getFullName(msg.author)));
    await answer(msg, "bot-restarting");
    writeJSON(absolutePath(tree["reloadme.json"]), {
      date: now()
    });
  }

  hasPermission(msg) {
    if (!checkRank(msg.author, ranks.DEV)) return say("err-lack-of-perms", rank(msg.author), ranks.DEV);
    else return true;
  }
};