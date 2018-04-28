/*global absolutePath client config Discord error fs ranks roles say tree*/

module.exports.name = "Utils";
module.exports.utils = {
  createArgs: (message) => {
    if (!(message instanceof Discord.Message)) return ["Invalid", "message"];
    let store = message.content.substring(config.p.length).split(" ");
    while (store[0] == '') store.shift();
    if (store.length == 0) store.push("");
    return store;
  },
  getFullName: (user) => {
    if (user instanceof Discord.User) return `${user.username}#${user.discriminator} (${user.id})`;
    else return "<@invalid_user>";
  },
  getShortName: (user) => {
    if (user instanceof Discord.User) return `${user.username}#${user.discriminator}`;
    else return "<@invalid_user>";
  },
  rank: (member) => {
    if (member instanceof Discord.GuildMember) {
      console.log(member.hasRole(roles.developer));
      if (member.hasRole(roles.developer)) return ranks.DEV;
      else if (member.hasRole(roles.admin)) return ranks.ADMIN;
      else if (member.hasRole(roles.staff)) return ranks.STAFF;
    }
    return ranks.PLAYER;
  },
  rankToString: (rank = 0) => {
    if (!isNaN(rank)) switch (rank) {
      case ranks.PLAYER:
        return say("rank-player");
      case ranks.STAFF:
        return say("rank-staff");
      case ranks.ADMIN:
        return say("rank-admin");
      case ranks.DEV:
        return say("rank-dev");
    }
  },
  maintenancePerm: (member) => {
    if (member instanceof Discord.GuildMember && module.exports.utils.rank(member) == ranks.DEV) return true;
    else return false;
  },
  mention: (element) => {
    if (element instanceof Discord.User) return `<@${element.id}>`;
    else if (element instanceof Discord.Channel) return `<#${element.id}>`;
    else return "<@invalid_user>";
  },
  now: () => {
    return new Date();
  },
  off: () => {
    client.destroy((err) => console.log(err));
    process.exit();
  },
  updateConfig: () => {
    module.exports.utils.writeJSON(absolutePath(tree["config.json"]), config);
  },
  writeJSON: (path = "", obj) => {
    if (fs.existsSync(path) && typeof obj == "object") fs.writeFile(path, JSON.stringify(obj), (e) => {
      if (e != null) error("utils.js", "writeJSON", e);
    });
    else error("utils.js", "writeJSON", `Path: ${path} -> ${fs.existsSync(path)} \nObj: ${JSON.stringify(obj)} -> ${typeof obj == "object"}`);
  }
};