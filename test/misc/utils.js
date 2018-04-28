/*global expect test*/
const mod = require("../../src/misc/utils.js");
const utils = mod.utils;
const Discord = require("discord.js");

test("Name check", () => {
  expect(mod.name).toBe("Utils");
});

test("createArgs", () => {
  let message = new Discord.Message();
  message.content = "This is a test message";
  expect(utils.createArgs(message)).toBe(["his", "is", "a", "test", "message"]);
});

test("getFullName", () => {
  let user = new Discord.User();
  user.username = "TotallyFake";
  user.discriminator = "1234";
  user.id = "123123123123123123";
  expect(utils.getFullName(user)).toBe("TotallyFake#1234 (123123123123123123)");
  expect(utils.getFullName({})).toBe("<@invalid_user>");
});

test("getShortName", () => {
  let user = new Discord.User();
  user.username = "TotallyFake";
  user.discriminator = "1234";
  user.id = "123123123123123123";
  expect(utils.getFullName(user)).toBe("TotallyFake#1234");
  expect(utils.getFullName({})).toBe("<@invalid_user>");
});

Discord.GuildMember.prototype.hasRole = function(role) {
  if (role instanceof Discord.Role)
    for (let r of this.roles.array())
      if (r == role) return true;
  return false;
};

test("rank", () => {
  let member = new Discord.GuildMember(),
    admin_role = new Discord.Role();
  admin_role.id = "123123123123123123";
  member.roles = new Discord.Collection();
  member.roles.set(admin_role.id, admin_role);
  global.roles = {
    admin: admin_role
  };
  global.ranks = {
    ADMIN: 2,
    PLAYER: 0
  };

  expect(utils.rank(member)).toBe(2);
  expect(utils.rank({})).toBe(0);
});

test("rankToString", () => {
  global.say = (text) => {
    if (text == "rank-player") return "Player";
    else if (text == "rank-dev") return "Developer";
  };
  expect(utils.rankToString(0)).toBe("Player");
  expect(utils.rankToString(3)).toBe("Developer");
});

test("maintenancePerm", () => {
  let member = new Discord.Member(),
    dev_role = new Discord.Role();
  member.roles = new Discord.Collection();
  dev_role.id = "1";
  global.roles = {
    developer: dev_role
  };
  member.roles.set(dev_role.id, dev_role);
  expect(utils.maintenancePerm(member)).toBe(true);
  expect(utils.maintenancePerm({})).toBe(false);
});

test("mention", () => {
  let user = new Discord.User(),
    channel = new Discord.Channel();
  user.id = "123123123123123123";
  channel.id = "123123123123123123";
  expect(utils.mention(user)).toBe("<@123123123123123123>");
  expect(utils.mention(channel)).toBe("<#123123123123123123>");
  expect(utils.mention({})).toBe("<@invalid_user>");
});

test("now", () => {
  expect(utils.now() instanceof Date).toBe(true);
});

//off, updateConfig & writeJSON not tested