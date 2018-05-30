/*global ranks*/
module.exports.name = "Music commands";

class Command {
  constructor(permission = ranks.PLAYER, name = "", syntax = "", description = "", hidden = false) {
    this.name = name;
    this.syn = syntax;
    this.des = description;
    this.rank = permission;
    this.hide = hidden;
  }
}

module.exports.obj = {
  play: new Command(ranks.PLAYER, "play", "play <YouTube link || Search term>", "Adds a video (or livestream) to the queue. If you are in a voice channel the bot will join it, if the queue is empty it will automatically start playing.", true),
  pause: new Command(ranks.PLAYER, "pause", "pause", "Pauses the stream.", true),
  stop: new Command(ranks.PLAYER, "stop", "stop", "Stops the music and clears the queue.", true),
  join: new Command(ranks.PLAYER, "join", "join", "Joins your voice channel.", true),
  skip: new Command(ranks.PLAYER, "skip", "skip", "Skips current song.", true),
  test: new Command(ranks.DEV, "mtest", "mtest", "Music test command")
};
module.exports.class = Command;