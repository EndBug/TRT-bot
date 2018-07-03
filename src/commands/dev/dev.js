/*global answer checkRank Commando config rank ranks say updateConfig*/

module.exports = class DevCMD extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "dev",
      aliases: ["development", "dnd", "maintenance"],
      group: "dev",
      memberName: "dev",
      description: say("dev-help"),
      args: [{
        key: "value",
        prompt: "Whether or not the maintenance mode should be active",
        type: "boolean",
        default: "undef"
      }]
    });
  }

  run(msg, {
    value
  }) {
    if (value == "undef") value = !config.maintenance;
    if (value != config.maintenance) {
      config.maintenance = value;
      updateConfig();
      answer(msg, `maintenance-${config.maintenance ? "on" : "off"}`);
    } else answer(msg, `maintenance-already-${config.maintenance ? "on" : "off"}`, true);
  }

  hasPermission(msg) {
    if (!checkRank(msg.author, ranks.DEV)) return say("err-lack-of-perms", rank(msg.author), ranks.DEV);
    else return true;
  }

};