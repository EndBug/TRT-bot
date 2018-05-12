/*global channels config error*/

module.exports.name = "Channel cleaning";

module.exports.clean = (curr, callback = () => {}) => {
  curr.fetchMessages().then((messages) => {
    if (messages.size > 0) curr.bulkDelete(100, true).then(module.exports.clean(curr, callback)).catch((e) => error("channel_cleaning.js", "clean/bulkDelete", e));
    else {
      setTimeout(() => module.exports.clean(curr), config.cleantimeMin * 60 * 1000);
      callback(messages.size);
    }
  }).catch((e) => error("channel_cleaning.js", "clean/fetchMessages", e));
};

module.exports.run = () => {
  let to_clean = [
    channels.bot,
    channels.nomic
  ];

  for (let curr of to_clean) module.exports.clean(curr);
};