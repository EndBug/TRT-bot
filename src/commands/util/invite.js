/*global answer Commando say*/

module.exports = class InviteCMD extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "invite",
      aliases: ["get-invite", "inv", "send-invite"],
      group: "util",
      memberName: "invite",
      description: say("invite-help"),
      details: say("invite-note")
    });
  }

  run(msg) {
    answer(msg, "invite-msg");
  }
};