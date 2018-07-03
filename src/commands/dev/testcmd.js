/*global checkRank Commando rank ranks say*/

module.exports = class TestCMD extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "test",
      group: "dev",
      memberName: "testcmd",
      description: say("test-help")
    });
  }

  async run(msg) {
    msg.say(`Debug test: \nRank: ${rank(msg.member)} \nHasDev: ${checkRank(msg.member, ranks.DEV, true)}`);
  }

  hasPermission(msg) {
    if (!checkRank(msg.author, ranks.DEV)) return say("err-lack-of-perms", rank(msg.author), ranks.DEV);
    else return true;
  }
};