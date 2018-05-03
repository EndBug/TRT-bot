/*global ActivityTypes client config PresenceStatuses*/

class Presence {
  constructor(name = "", type = ActivityTypes.PLAYING, status = PresenceStatuses.ONLINE, stream = "") {
    this.status = status;
    this.afk = false;
    this.game = {
      name,
      type,
      url: stream
    };
  }
}

var is = 0,
  im = 0;

var status = [
  new Presence(`${config.p}help`),
  new Presence(`PREFIX → ${config.p}`),
  new Presence("you", ActivityTypes.WATCHING)
];

var maintenance = [
  new Presence("with the Wumpus...", ActivityTypes.PLAYING, PresenceStatuses.DND),
  new Presence("maintenance work...", ActivityTypes.WATCHING, PresenceStatuses.DND)
];

module.exports.name = "Status rotation";
module.exports.run = () => {
  let curr;
  if (!config.maintenance) {
    curr = status[is];
    is++;
    is %= status.length;
  } else {
    curr = maintenance[im];
    im++;
    im %= maintenance.length;
  }
  client.user.setStatus(curr.status);
  client.user.setActivity(curr.game.name, {
    type: curr.game.type
  });
  setTimeout(module.exports.run, config.statusSec * 1000);
};