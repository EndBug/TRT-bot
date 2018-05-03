/*global channels config error*/

module.exports.name = "Channel cleaning";

module.exports.clean = (curr, callback = () => {}) => {
  curr.bulkDelete(100, true)
    .then((messages) => {
      if (messages.size >= 100) module.exports.clean(curr);
      else {
        setTimeout(() => module.exports.clean(curr), config.cleantime * 60 * 1000);
        setTimeout(() => callback(messages.size), 3000);
      }
    })
    .catch((e) => error("channel_cleaning.js", "run", e));
};

module.exports.run = () => {
  let to_clean = [
    channels.bot,
    channels.nomic
  ];

  for (let curr of to_clean) module.exports.clean(curr);
};