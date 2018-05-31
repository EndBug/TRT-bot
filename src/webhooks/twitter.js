/*global channels config error Twit twitterAccountsToQuery twitter_api_key twitter_api_secret webhooks*/
module.exports.name = "Twitter webhook";

module.exports.run = (force = 0) => {
  let forced = (force != 0);
  var T = new Twit({
    consumer_key: twitter_api_key,
    consumer_secret: twitter_api_secret,
    app_only_auth: true,
    timeout_ms: 60 * 1000
  });
  var settings = config.webhooks.twitter;

  var hook = webhooks.twitter;

  let send = (tweet) => {
    return hook.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, {
      username: tweet.user.name,
      avatarURL: tweet.user.profile_image_url
    });
  };

  T.get("search/tweets", {
    q: twitterAccountsToQuery(settings.targets, settings.options),
    count: 25
  }, (err, data) => {
    if (err) {
      let ignore = [
        "Error: Unexpected reply from Twitter upon obtaining bearer token"
      ];
      if (!ignore.includes(err)) console.log(`[WEBHOOKS/TWITTER] Ignored Twitter error: ${err}`);
      else error("twitter.js", "get search/tweets", err);
      setTimeout(module.exports.run, settings.refreshMin * 60000);
    } else {
      let tweets = data.statuses;
      let last;
      channels.twitter.fetchMessages({
        limit: 1
      }).then(messages => {
        last = messages.first().createdAt;
        if (last instanceof Date) {
          let t = tweets.length - 1;
          let go = () => {
            let tweet = tweets[t];
            let stamp = new Date(tweet.created_at);
            if (stamp > last || force > 0) {
              send(tweet).then(() => {
                t--;
                force--;
                if (t >= 0 && (!forced || (forced && force > 0))) go();
              }).catch(e => error("twitter.js", "hook.send", e));
            } else {
              t--;
              if (t >= 0) go();
            }
          };
          go();
          if (!forced) setTimeout(module.exports.run, settings.refreshMin * 60000);
        } else error("twitter.js", "TextChannel.fetchMessages", `Message.createdAt is not a date:\n${last}`);
      }).catch(e => error("twitter.js", "TextChannel.fetchMessages", e));
    }
  });
};