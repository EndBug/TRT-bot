/*global client config Discord error fs guild owner ranks roles say settings*/

module.exports.name = "Utils";
module.exports.utils = {
  checkRank: (member, rank, strict = false) => {
    let mr = module.exports.utils.rank(member);
    return (mr >= rank || (member.user == owner && !strict));
  },
  createArgs: (message) => {
    if (!(message instanceof Discord.Message)) return ["Invalid", "message"];
    let store = message.content.substring(config.p.length).split(/([ \n])+/g);
    while (store[0] == '') store.shift();
    store = store.filter(function (a) {
      return (a !== '\n' && a !== " ");
    });
    if (store.length == 0) store.push("");
    return store;
  },
  getFullName: (user) => {
    if (user instanceof Discord.GuildMember) user = user.user;
    if (user instanceof Discord.User) return `${user.username}#${user.discriminator} (${user.id})`;
    else return "<@invalid_user>";
  },
  getShortName: (user) => {
    if (user instanceof Discord.GuildMember) user = user.user;
    if (user instanceof Discord.User) return `${user.username}#${user.discriminator}`;
    else return "<@invalid_user>";
  },
  rank: (member) => {
    if (member instanceof Discord.User) member = module.exports.utils.userToMember(member);
    if (member instanceof Discord.GuildMember) {
      if (member.roles.has(roles.developer.id)) return ranks.DEV;
      else if (member.roles.has(roles.admin.id)) return ranks.ADMIN;
      else if (member.roles.has(roles.staff.id)) return ranks.STAFF;
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
  mentionToID: (str) => {
    return str.replace(/[\\<>@#&!]/g, "");
  },
  now: () => {
    return new Date();
  },
  off: () => {
    client.destroy((err) => console.log(err));
    process.exit();
  },
  randomInt: (min, max) => {
    max += 0.001;
    return Math.floor(Math.random() * (max - min) + min);
  },
  twitterAccountsToQuery: (accounts = [], options = "") => {
    let final = `from:${accounts.join(" OR from:")}`;
    final += ` ${options}`;
    return final;
  },
  updateConfig: () => {
    let obj = Object.assign({}, config); //prevents editing config itself
    obj.maintenance = `${obj.maintenance} `;
    return settings.set("config", obj);
  },
  userToMember: (user) => {
    if (user instanceof Discord.User) return guild.members.get(user.id);
  },
  writeJSON: (path = "", obj) => {
    if (fs.existsSync(path) && typeof obj == "object") fs.writeFile(path, JSON.stringify(obj), (e) => {
      if (e != null) error("utils.js", "writeJSON", e);
    });
    else error("utils.js", "writeJSON", `Path: ${path} -> ${fs.existsSync(path)} \nObj: ${JSON.stringify(obj)} -> ${typeof obj == "object"}`);
  }
};
