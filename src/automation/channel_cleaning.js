/*global channels config error*/

module.exports.name = "Channel cleaning";

module.exports.clean = async (curr, olderMode = false) => {
  let collected = await curr.fetchMessages();
  if (collected.size > 0) {
    if (olderMode) {
      for (let msg of collected.array()) {
        await msg.delete();
      }
    } else {
      let deleted = await curr.bulkDelete(100, true);
      if (deleted.size < collected.size) olderMode = true;
    }

    return await module.exports.clean(curr, olderMode).catch(e => error("channel_cleaning.js", "clean/bulkDelete", e));
  } else {
    setTimeout(() => module.exports.clean(curr), config.clean * 60 * 1000);
    return collected.size;
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
