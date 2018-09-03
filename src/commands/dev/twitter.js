/*global answer checkRank Commando error rank ranks say settings*/

module.exports = class TwitterCMD extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "twitter",
      aliases: ["tweet", "twit"],
      group: "dev",
      memberName: "twitter",
      description: say("twitter-help"),
      args: [{
        key: "mode",
        prompt: say("twitter-help-mode"),
        type: "string",
        oneOf: ["add", "remove"]
      }, {
        key: "target",
        prompt: say("twitter-help-target"),
        type: "string",
      }]
    });
  }

  run(msg, { mode, target }) {
    settings.get("twitter").then(async obj => {
      let curr = JSON.parse(obj.targets);
      if (mode == "add") curr.push(target);
      else if (mode == "remove") {
        if (curr.includes(target)) curr.splice(curr.indexOf(target), 1);
        else {
          answer(msg, "twitter-notarget");
          return;
        }
      } else {
        error("TwitterCMD", "run", `Mode should not be \`${mode}\``);
        return;
      }
      await settings.assign("twitter", {
        targets: JSON.stringify(curr)
      });
      answer(msg, `twitter-${mode == "add" ? "add" : "remove"}`, target);
    });
  }

  hasPermission(msg) {
    let perm = ranks.DEV;
    if (!checkRank(msg.author, perm)) return say("err-lack-of-perms", rank(msg.author), perm);
    else return true;
  }
};
