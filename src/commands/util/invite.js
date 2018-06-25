/*global Commando say*/

module.exports = class InviteCMD extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "invite",
      aliases: ["get-invite", "send-invite", "inv"],
      group: "util",
      memberName: "invite",
      description: say("invite-help"),
      details: say("invite-note")
    });
  }

  run(msg) {
    msg.answer("invite-msg");
  }
};