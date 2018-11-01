/*global channels config error*/

module.exports.name = "Channel cleaning";

module.exports.clean = async (curr) => {
  let messages = await curr.fetchMessages();
  if (messages.size > 0) {
    await curr.bulkDelete(100, true);
    return await module.exports.clean(curr).catch(e => error("channel_cleaning.js", "clean/bulkDelete", e));
  } else {
    setTimeout(() => module.exports.clean(curr), config.clean * 60 * 1000);
    return messages.size;
  }
};

module.exports.run = async (...extra) => {
  let to_clean = [
    channels.bot,
    channels.nomic,
    ...extra
  ];

  for (let curr of to_clean) await module.exports.clean(curr);
};
