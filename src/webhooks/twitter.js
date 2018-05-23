/*global channels config error Twit twitterAccountsToQuery twitter_api_key twitter_api_secret webhooks*/
module.exports.name = "Twitter webhook";

module.exports.run = (force = 0) => {
  let forced = false;
  if (force > 0) forced = true;
  var T = new Twit({
    consumer_key: twitter_api_key,
    consumer_secret: twitter_api_secret,
    app_only_auth: true,
    timeout_ms: 60 * 1000
  });
  var settings = config.webhooks.twitter;

  var hook = webhooks.twitter;

  let send = (tweet) => {
    hook.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, {
      username: tweet.user.name,
      avatarURL: tweet.user.profile_image_url
    }).then(() => {
      force--;
    }).catch(e => error("twitter.js", "hook.send", e));
  };

  T.get("search/tweets", {
    q: twitterAccountsToQuery(settings.targets, settings.options),
    count: 25
  }, (err, data) => {
    if (err) {
      error("twitter.js", "get search/tweets", err);
      return;
    }
    let tweets = data.statuses;
    let last;
    channels.twitter.fetchMessages({limit: 1}).then(messages => {
      last = messages.first().createdAt;
      if (last instanceof Date) {
        for (let tweet of tweets) {
          let stamp = new Date(tweet.created_at);
          if (stamp < last || (forced && force > 0)) {
            send(tweet);
          }
        }
        setTimeout(module.exports.run, settings.refreshMin*60000);
      } else error("twitter.js", "TextChannel.fetchMessages", `Message.createdAt is not a date:\n${last}`);
    }).catch(e => error("twitter.js", "TextChannel.fetchMessages", e));
  });
};
