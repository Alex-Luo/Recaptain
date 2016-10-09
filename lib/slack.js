var slack = require('slack');
var token = process.env.token;
var _ = require('lodash');
var moment = require('moment');

function promisfy(command, params) {
  return new Promise((resolve, reject) => command(params, (err, data) => err ? reject(err) : resolve(data)));
};

function history(channel, oldest) {
  return promisfy(slack.channels.history, {token, channel, oldest: (oldest.toDate().getTime() / 1000)})
    .catch((err) => {
      if (err.error == "channel_not_found") {
        reject("Please Enter a valid channel!");
      } else {
        reject(err);
      }
    });
}

var history_recursive = (channel, arr) => (result) => {
  arr = _.concat(arr, result.messages);
  if (result.has_more) {
    var last_msg_time = result.messages[0].ts;
    return history(channel, moment.unix(last_msg_time))
      .then(history_recursive(channel, arr));
  } else {
    return arr;
  };
};

exports.history = (channel, oldest) => {
  if (!oldest) oldest = moment().subtract(2, 'weeks');

  return history(channel, oldest)
    .then(history_recursive(channel, []))
    .then((result) => _.filter(result, (e) => e.text != null));
};

exports.im = (user) => {
  return promisfy(slack.im.open, {token, user});
};

exports.post = (channel, text, icon, username, attach) => {
    return promisfy(slack.chat.postMessage, {token, channel, text, icon_url: icon, username, attachments: JSON.stringify(attach)});
};

exports.userdata = (user) => {
  return promisfy(slack.users.info, {token, user});
};

exports.joinChannel = (name) => {
  return promisfy(slack.channels.join, {token, name});
};

exports.getGeneralChannel = (token) => {
  return promisfy(slack.channels.list, {token})
    .then((result) => {
      var general;
      for (var i = 0; i < result.channels.length; i++){
        if (result.channels[i].is_general == true){
          general = JSON.stringify(result.channels[i].id);
        }
      }
      return general;
    });
};
