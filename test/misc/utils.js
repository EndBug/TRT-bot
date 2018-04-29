/*global Discord expect test*/
global.Discord = require("discord.js");
global.fetch = require("node-fetch");
const token = `${process.env.TEST_TOKEN}`;
const mod = require("../../src/misc/utils.js");
const utils = mod.utils;
const client = new Discord.Client();

Discord.GuildMember.prototype.hasRole = function(role) {
  if (role instanceof Discord.Role)
    for (let r of this.roles.array())
      if (r == role) return true;
  return false;
};



test("Name check & login", async () => {
  let p = new Promise((resolve) => {
    client.login(token);
    client.on("ready", () => resolve());
  });
  await p;
  expect(mod.name).toBe("Utils");
});


test("createArgs", () => {
  let message = new Discord.Message();
  message.content = "This is a test message";
  global.config = {
    p: "."
  };
  expect(utils.createArgs(message)).toEqual(["his", "is", "a", "test", "message"]);
});

test("getFullName", () => {
  let user = client.user;
  expect(utils.getFullName(user)).toBe(`${user.username}#${user.discriminator} (${user.id})`);
  expect(utils.getFullName({})).toBe("<@invalid_user>");
});

test("getShortName", () => {
  let user = client.user;
  expect(utils.getShortName(user)).toBe(`${user.username}#${user.discriminator}`);
  expect(utils.getShortName({})).toBe("<@invalid_user>");
});

test("rank", () => {
  let guild = client.guilds.get("406797621563490315");
  let member = guild.members.get(client.user.id),
    role_1 = guild.roles.find("name", "role_1");
  global.roles = {
    admin: role_1
  };
  global.ranks = {
    ADMIN: 2,
    PLAYER: 0
  };
  expect(utils.rank(member)).toBe(2);
  expect(utils.rank({})).toBe(0);
});

test("rankToString", () => {
  global.ranks = {
    PLAYER: 0,
    DEV: 3
  };
  global.say = (text) => {
    if (text == "rank-player") return "Player";
    else if (text == "rank-dev") return "Developer";
  };
  expect(utils.rankToString(0)).toBe("Player");
  expect(utils.rankToString(3)).toBe("Developer");
});

test("maintenancePerm", () => {
  let guild = client.guilds.get("406797621563490315");
  let member = guild.members.get(client.user.id),
    role_1 = guild.roles.find("name", "role_1");
  global.roles = {
    developer: role_1
  };
  expect(utils.maintenancePerm(member)).toBe(true);
  expect(utils.maintenancePerm({})).toBe(false);
});

test("mention", () => {
  let guild = client.guilds.get("406797621563490315");
  let user = client.user,
    channel = guild.channels.find("type", "text");
  expect(utils.mention(user)).toBe(`<@${user.id}>`);
  expect(utils.mention(channel)).toBe(`<#${channel.id}>`);
  expect(utils.mention({})).toBe("<@invalid_user>");
});

test("now", () => {
  expect(utils.now() instanceof Date).toBe(true);
});

//off, updateConfig & writeJSON not tested