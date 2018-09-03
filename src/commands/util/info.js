/*global answer Commando owner say*/

module.exports = class InfoCMD extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "info",
      aliases: ["bot-info", "get-info"],
      group: "util",
      memberName: "info",
      description: say("info-help")
    });
  }

  run(msg) {
    answer(msg, "info-msg", owner);
  }

};
