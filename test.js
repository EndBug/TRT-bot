/*global client Discord expect guild jest test*/
require('dotenv').config();
global.Discord = require("discord.js");
global.fetch = require("node-fetch");
global.fs = require("fs");
global.branch = "master";
if (process.env.NODE_HOME != "/app/.heroku/node") global.branch = require("git-branch").sync(); //does not work in Heroku, but in Heroku only the master branch is deployed
global.client = new Discord.Client();
global.config = {
  p: "."
};
global.PresenceStatuses = {
  DND: "dnd",
  IDLE: "idle",
  INVISIBLE: "invisible",
  ONLINE: "online"
};
global.ActivityTypes = {
  LISTENING: "WATCHING",
  PLAYING: "PLAYING",
  STREAMING: "STREMING",
  WATCHING: "WATCHING"
};
jest.setTimeout(10000);

const token = `${process.env.TEST_TOKEN}`;

const utils = require("./src/misc/utils.js");
const channel_cleaning = require("./src/automation/channel_cleaning.js");
const reactions = require("./src/automation/reactions.js");
const status = require("./src/automation/status_rotation.js");


Discord.GuildMember.prototype.hasRole = function (role) {
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

  global.guild = client.guilds.get("406797621563490315");

  expect(utils.name).toBe("Utils");
  expect(channel_cleaning.name).toBe("Channel cleaning");
  expect(reactions.name).toBe("Reactions control");
  expect(status.name).toBe("Status rotation");
});

test("tree", () => {
  global.goGlobal = () => {};
  require("./tree.js");
});

test("createArgs", () => {
  let message = new Discord.Message();
  message.content = "This is a test message";
  global.config = {
    p: "."
  };
  expect(utils.utils.createArgs(message)).toEqual(["his", "is", "a", "test", "message"]);
});

test("getFullName", () => {
  let user = client.user;
  expect(utils.utils.getFullName(user)).toBe(`${user.username}#${user.discriminator} (${user.id})`);
  expect(utils.utils.getFullName({})).toBe("<@invalid_user>");
});

test("getShortName", () => {
  let user = client.user;
  expect(utils.utils.getShortName(user)).toBe(`${user.username}#${user.discriminator}`);
  expect(utils.utils.getShortName({})).toBe("<@invalid_user>");
});

test("rank", () => {
  let member = guild.members.get(client.user.id),
    role_1 = guild.roles.find(r => r.name == 'role_1');
  global.roles = {
    developer: role_1
  };
  global.ranks = {
    DEV: 3,
    PLAYER: 0
  };
  expect(utils.utils.rank(member)).toBe(3);
  expect(utils.utils.rank({})).toBe(0);
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
  expect(utils.utils.rankToString(0)).toBe("Player");
  expect(utils.utils.rankToString(3)).toBe("Developer");
});

test("maintenancePerm", () => {
  let member = guild.members.get(client.user.id),
    role_1 = guild.roles.find(r => r.name == 'role_1');
  global.roles = {
    developer: role_1
  };
  expect(utils.utils.maintenancePerm(member)).toBe(true);
  expect(utils.utils.maintenancePerm({})).toBe(false);
});

test("now", () => {
  expect(utils.utils.now() instanceof Date).toBe(true);
});

test("clean", async () => {
  global.config = {
    clean: 120
  };
  let channel = guild.channels.find(c => c.type == 'text');
  global.error = console.log;
  await channel.send("Prune test.");
  let result = await channel_cleaning.clean(channel);

  expect(result).toBeLessThanOrEqual(100);
});

test("reactions", async () => {
  reactions.run(false);
  let res;
  let p = new Promise((resolve, reject) => {
    client.on("messageReactionRemove", (reaction) => {
      res = reaction.message.reactions.size;
      resolve();
      reject();
    });
    let channel = guild.channels.find(c => c.type == 'text');
    channel.send("Reaction test.").then((message) => {
      message.react("😂").then(() => message.react("😏"));
    });
  });
  await p;
  expect(res).toBe(1);
});

test("status rotation", async () => {
  global.config = {
    p: ".",
    maintenance: false,
    statusSec: 709
  };
  status.run();
  expect(client.user.presence.status).toBe("online");
  global.config.maintenance = true;
  status.run();
  expect(client.user.presence.status).toBe("dnd");
});

//off, updateConfig & writeJSON not tested
