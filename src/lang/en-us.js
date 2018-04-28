module.exports = (name, v1, v2) => {
  let messages = {
    "bot-reloading": "Bot is reloading...",
    "bot-reloaded": `--- Bot reloaded by ${v1} ---`,
    "bot-shutdown": `---- Bot shut down by ${v1} ---`,
    "bot-shutting": "Bot shutting down...",
    "dev-help": "Sets the bot in \"Maintenance\" status.",
    "eval-help": "Runs code from messages.",
    "help-author": `TRT Bot Command help - ${v1}`,
    "help-comingsoon": "Coming soon...",
    "help-help": "Shows this page.",
    "help-morepages": `Page ${v1} of ${v2}.`,
    "help-onepage": "There's only one help page.",
    "help-success": ":white_check_mark: I've just sent you a Direct Message :wink:",
    "info-help": "Sends infos about the bot.",
    "info-msg": `TRT Bot has been built by ${v1} for the TRT server. It's made in Node.js, usign the Discord.js library. If you want to start developing bots, check this servers:\nhttps://discord.gg/discord-api\nhttps://discord.gg/bRCvFy9\nIf you want to check out this bot, go to https://github.com/EndBug/trt-bot (disclaimer: not a good coder, might not want to read that)`,
    "invite-help": "Replies with the invite for this server.",
    "invite-msg": "Share this link! ;)\nhttps://discord.gg/TJc4r9X",
    "maintenance-off": "Bot set in public mode.",
    "maintenance-on": "Bot set in developer mode.",
    "err-lack-of-perms": `[ERR] You don't have the permissions to perform this command (${v1} - ${v2}).`,
    "err-undef-arg": `[ERR] Argument(s) number \`${v1}\` are undefined.`,
    "moderation-required": `**MODERATION REQUIRED:**\nUser: ${v1}\nChannel: ${v2}`,
    "off-help": "Shuts down the bot.",
    "ping-help": "Replies with *pong!*. Useful to test internet ping.",
    "pref-change": `The prefix will be changed to \`${v1}\``,
    "pref-help": `Changes the bot prefix. At the moment the prefix is ${v1}`,
    "rank-admin": "Administrator",
    "rank-dev": "Developer",
    "rank-player": "User",
    "rank-staff": "Staff",
    "reload-help": "Reloads the bot.",
    "test-help": "Custom test command",

    "test": `ok`
  };

  return messages[name];
};