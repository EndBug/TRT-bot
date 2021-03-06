module.exports = (name, ...v) => {
  let [v1, v2, v3, v4] = v;
  let links = {
    discordAPI: "https://discord.gg/discord-api",
    discordjs: "https://discord.gg/bRCvFy9",
    githubRepo: "https://github.com/EndBug/trt-bot"
  };

  let messages = {
    "bot-restarted": `--- Bot restarted by ${v1} ---`,
    "bot-restarting": "Bot is restarting...",
    "bot-shutdown": `---- Bot shut down by ${v1} ---`,
    "bot-shutting": "Bot shutting down...",
    "dev-help": "Sets the bot in \"Maintenance\" status.",
    "err-lack-of-perms": `[ERR] You don't have the permissions to perform this command (${v1} - ${v2}).`,
    "err-undef-arg": `[ERR] Argument(s) number \`${v1}\` are undefined.`,
    "eval-help": "Runs code from messages.",
    "game-add": "Added a game role",
    "game-author": "Role request system",
    "game-build": "Building...",
    "game-msg": "React with the emojis:",
    "game-no": `${v1} game${v1 > 1 ? "s" : ""}`,
    "game-rem": "Removed a game role",
    "help-author": `TRT Bot Command help - ${v1}`,
    "help-comingsoon": "Coming soon...",
    "help-help": "Shows this page.",
    "help-morepages": `Page ${v1} of ${v2}.`,
    "help-onepage": "There's only one help page.",
    "help-success": ":white_check_mark: I've just sent you a Direct Message :wink:",
    "ignored-cmd": `Please use ${v1} for bot commands.`,
    "info-help": "Sends infos about the bot itself.",
    "info-msg": `TRT Bot has been built by ${v1} for the TRT server. It's made in Node.js, usign the Discord.js library and its extension Commando. At the moment I'm running it on Heroku, that auto-deploys the bot every time a change on the master is pushed. If you want to start developing bots, check this servers:\n${links.discordAPI}\n${links.discordjs}\nIf you want to check out this bot, go to ${links.githubRepo} (disclaimer: not a good coder, might not want to read that)`,
    "invite-help": "Replies with the invite for this server.",
    "invite-msg": "Share this link! ;)\nhttps://discord.gg/TJc4r9X",
    "invite-note": "Don't worry, this won't expire!",
    "maintenance-already-off": "Bot is already in public mode.",
    "maintenance-already-on": "Bot is already in developer mode.",
    "maintenance-off": "Bot set in public mode.",
    "maintenance-on": "Bot set in developer mode.",
    "moderation-required": `**MODERATION REQUIRED:**\nUser: ${v1}\nChannel: ${v2}`,
    "off-help": "Shuts down the bot.",
    "ping-help": "Replies with *pong!*. Useful to test internet ping.",
    "pref-change": `The prefix will be changed to \`${v1}\``,
    "pref-help": `Changes the bot prefix. At the moment the prefix is ${v1}`,
    "rank-admin": "Administrator",
    "rank-dev": "Developer",
    "rank-player": "User",
    "rank-staff": "Staff",
    "restart-help": "Restarts the bot.",
    "running": "TRT Bot is running.",
    "test-help": "Custom test command",
    "twitter-add": `Added \`${v1}\` to Twitter watchlist. Reload the bot to apply changes.`,
    "twitter-remove": `Removed \`${v1}\` from Twitter watchlist. Reload the bot to apply changes.`,
    "twitter-help": "Manages twitter targets.",
    "twitter-help-mode": "Whether you want to add or remove targets. Can be either `add` or `remove`.",
    "twitter-help-target": "The user you want to target on Twitter (by full username).",
    "welcome": `Welcome ${v1}! Look at the ${v2} channel to see how this server works ;)\nTo get a game role, go to ${v3}.\nRemember that bot commands only work in ${v4}!`,

    "language": "American English",
    "test": `ok`
  };

  return messages[name];
};
