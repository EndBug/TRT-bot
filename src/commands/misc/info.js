/*global Commando say*/

module.exports = class InfoCMD extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "info",
      aliases: ["bot-info", "get-info"],
      group: "misc",
      memberName: "info",
      description: say("info-help")
    });
  }

  run(msg) {
    msg.answer("info-msg");
  }

};
