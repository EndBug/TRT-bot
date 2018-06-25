/*global checkRank Commando config rank ranks say settings*/

module.exports = class DevCMD extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "dev",
      aliases: ["maintenance", "development", "dnd"],
      group: "dev",
      memberName: "dev",
      description: say("dev-help"),
      args: [{
        key: "value",
        prompt: "Whether or not the maintenance mode should be active",
        type: "boolean",
        default: !config.maintenance
      }]
    });
  }

  run(msg, {
    value
  }) {
    config.maintenance = value;
    settings.set("config", config);
    msg.answer(`maintenance${config.maintenance ? "on" : "off"}`);
  }

  hasPermission(msg) {
    if (!checkRank(msg.author, ranks.DEV)) return say("err-lack-of-perms", rank(msg.author), ranks.DEV);
    else return true;
  }

};