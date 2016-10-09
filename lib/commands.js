var token = process.env.token;
var parse = require('./parse');
var modules = require('./modules');
var _ = require('lodash');
var slack = require('./slack');
var parse = require('./parse');
var watson = require('./watson');
var moment = require('moment');
var excuse = require('huh');

var icon = "https://avatars.slack-edge.com/2016-06-13/50511039062_3e2a383deda13028950f_32.png";

var users_in_help = []

// Handles the `recap` command
exports.recap = (message) => {
  let { channel, text, user, username, ts } = message;
  console.log("Channel Requested: ", text);
  if (/\|+.*>/.test(text) == 1){
    text = text.replace(/\|[a-zA-Z]*>/i, ">")
    console.log("-> Mobile Request")
  }

  parse(text)
    .then((ast) => {
      if (ast.channels.length != 0) return ast;
      else return Promise.reject("Please Enter Channels! For example, you should use me like this... \n> ```recap #channel1 #channel2 #channel3```");
    })
  // Store channel ID's and Strip special characters
    .then((result) => {
      for (var i = 0; i < result.channels.length; i++){
        // Check if message sent from mobile
        if (/\|+.*>/.test(result.channels[i]) == true){
          result.channels[i] = result.channels[i].replace(/\|[a-zA-Z]*>/i, "");
        }
        result.channels[i] = result.channels[i].replace(/[^a-zA-Z0-9 ]/g, "");
      }
      return result;
    })
    // Fetch and store channel history for every entry in channel ID array
    .then((result) => {
      let history_list = [];
      let channel_names = [];

      for (var i = 0; i < result.channels.length; i++){
        getHandle(user);
        history_list.push(slack.history(result.channels[i], result.date));
        channel_names.push(result.channels[i]);
      }

      return Promise.all([Promise.all(history_list), Promise.all(channel_names)])
	      .then((history) => {
		      return {
		        history,
		        ast: result
		      };
	      });
    })
  // Apply watson on the messages to determine relative relevance
	  .then((res) => {
	    let { history, ast } = res;
      let [history_list, channel_names] = history;

      return Promise.all(_.map(history_list, (messages, i) => {
        let l = _.chain(messages)
              .filter((es) => !/has joined the channel/i.test(es.text) || !/Slack for iOS Upload/i.test(es.text))
              .map((esta) => {
                return esta.text;
              })
              .value();

        let text = _.join(l, '\n');
        if(ast.keywords.length == 0){
          return watson.get_keywords(text)
            .then((res) => {
              console.log(res);
              return {
                result: _.filter(res.keywords, (e) => {
                  if (e.relevance < 0.85) {
                    return false;
                  } else {
                    return true;
                  }
                }),
                messages,
                channel_name: channel_names[i]
              };
            });
        } else {
          return { 
            result: _.map(ast.keywords, (e) => ({text: e, relevance: 1.0})),
            messages,
            channel_name: channel_names[i]
          };
        }
      }));
    })
    .then((result) => {
      return Promise.all(_.map(result, (e) => {
        return modules.keyword(e.messages, message, e.result)
          .then((res) => ({result : res, channel_name: e.channel_name}));
      }));
    })
    .then((result) => {
      let attach_message = [];

      for (i = 0; i<result.length; i++){
        attach_message.push(result[i]);
      }

      return Promise.all(attach_message);
    })
    .then((result) => {
      // break earlly, no user in the list
      if (!users_in_help[user]) {
        return Promise.all(result);
      }

      // they do exist, check status and index
      if (users_in_help[user].status) {
        username = "recaptain";
        if (users_in_help[user].index == 1 && /<#C0AS7C51D>/.exec(text)) {
          text = ("These are all the highlights from the General Channel. Pretty important if you ask me...\n From the summary, you can see when important conversations were occurring.");
        }
        else if (users_in_help[user].index == 2 && /<#C0AS7C51D> past 4 days/.exec(text)) {
          text = ("This can be great for smaller time spans, such as the past day, or few hours. However, if there aren't any messages in the time frame, I can't bring anything back.")
        }
        else if (users_in_help[user].index == 3 && /<#C0AS7C51D> foxden/.exec(text)) {
          text = ("This can be great to have more specific summaries and searches if you know what's important ahead of time. However, if there aren't any messages that match, i can't bring anything back.")
        }
        else {
          return Promise.reject("Hmmm... I didn't understand what you requested. Try typing the command again. It should be in one of the boxes :point_up: above. If you want to exit the tutorial, simply type *stop*")
        }

        return slack.post(channel, text, icon, username)
          .then(() => Promise.all(result));
      }
      return Promise.all(result);
    })
    .then((result) => {
      var arr = [];

      for (i = 0; i<result.length; i++){
        result[i].result = result[i].result.replace(/(\r\n|\n|\r)/gm,"\n");
        let message = {
          username: "recaptain",
          channel: channel,
          text: "",
          attach: [{
            title: "<\#" + result[i].channel_name + ">",
            color: "#5F9F9F",
            text: (result[i].result),
            mrkdwn_in: [
              "text",
              "title"
            ]
          }]
        };
        arr.push(slack.post(message.channel, message.text, icon, message.username, message.attach));
      }

      return Promise.all(arr);
    })
    .then((result) => {
      // break earlly, no user in the list
      if (!users_in_help[user]) {
        return Promise.all(result);
      }

      // they do exist, check status and index
      if (users_in_help[user].status) {
        username = "recaptain";
        if (users_in_help[user].index == 1) {
          text = (">I can even recap multiple channels at once, like this: \n>```recap #general #random``` \nNice job on the basics! Let's move on :relaxed: :+1: \n> I understand time ranges too. Try typing: \n>```recap #general past 4 days``` \n> in this text box :point_down: to get a summary of the channel from the past four days.");
          users_in_help[user].index += 1;
        }
        else if (users_in_help[user].index == 2) {
          text = (">These are the time frames I understand: _past week, past 5 weeks, past day, past 3 days, past hour, past 6 hours, yesterday, today._ \n>You can also have me look for conversations by including a keyword in your search. You can also customize your searches with keyword functionality. Let's try searching for a keyword. Try typing: \n>```recap #general foxden``` \n>in this text box :point_down: to search for any instance of food in general.")
          users_in_help[user].index += 1;
        }
        else if (users_in_help[user].index == 3) {
          text = ("> You can also search for multiple keywords and include a time frame. Here are some examples I understand: \n>```recap #general food water\nrecap #general food water past day``` \nThat’s it! Now you are ready to recap your chats. If you need a quick list of commands I understand, type *help* at anytime. You can also type *hi* to go through this exercise again. \n:memo:Take a minute to help out our team from this short survey: https://www.surveymonkey.com/r/DSSNDSC")
          reset_help_status(user)
        }

        return slack.post(channel, text, icon, username)
          .then(() => Promise.all(result));
      } 
      return Promise.all(result);
    })
	  .catch((err) => {
      console.log(err);
      slack.im(user)
        .then((result) => {
        let message = {
        username: "recaptain",
        channel: result.channel.id,
        text: "",
            attach: [{
              title: "ERROR: " + excuse.get(),
              text: err,
              color: "#FF0000",
              mrkdwn_in: [
                "text",
                "title"
              ]
            }]
          };

          slack.post(message.channel, message.text, icon, message.username, message.attach);
        });
	  });
};

exports.help = (message, ast) => {
    let { channel, text, user, username, ts, general } = message;
    console.log("Help Request Initiated"); 
    
      getHandle(user)
        .then((result) => {
            return slack.im(user)
            .then((res) => ({
                data: res,
                name: result
            }))
        })
        .then((result) => {
          let {data, name} = result;
          if(data.channel.id == channel) {
            channel = data.channel.id;
            text = ("Hey <@" + user + ">, I'm here to help you recap channels, so you don't have to read everything.\n:memo:Take a minute to help out our team from this short survey: https://www.surveymonkey.com/r/DSSNDSC \nIf you ever need more help, type *hi* for a quick tutorial. \nHere are some commands I understand.");
            attach =  [{
              "text": "*Simple recap usage*: \n```recap #general \nrecap #general #random``` \n*Give a time span*: you can use commands such as _past week, past 5 weeks, past day, past 3 days, past hour, past 6 hours, yesterday, today._ \n```recap #general past 5 hours \nrecap #general yesterday``` \n*Keyword*: add a keyword to the search \n```recap #general foxden```",
              "color": "#36a64f",
              "mrkdwn_in": [
                "text"
              ]
            }]

            return slack.post(channel, text, icon, "recaptain", attach)
          }
       })
       .catch((err) => {
         console.log(err);
       });
};

exports.hi = (message) => {
    let { channel, text, user, username, ts, general } = message;
    console.log("Hi Request Initiated"); 
      getHandle(user)
        .then((result) => {
            return slack.im(user)
            .then((res) => ({
                data: res,
                name: result
            }))
        })        
        .then((result) => {
          let {data, name} = result;
          if(data.channel.id == channel) {
            channel = data.channel.id;
            if (!users_in_help[user]) {
              users_in_help[user] = {status: false, index: 0}
            }

            if (users_in_help[user].index == 0) {
              text = ("Hello " + name + "! My name is Recaptain. I'm a friendly bot that helps you recap the Slack chats you have missed. My job is to look at all of your public conversations and tell you what was important. \nIf you ever need to quit the tutorial, simply type *stop* in the chat box. \nLet's get started by typing \n```recap <#C0AS7C51D>``` \nin this text box :point_down: to get a summary of the General Channel.");
              users_in_help[user] = {status: true, index: 1};
            }
            slack.post(channel, text, icon, "recaptain");
          }
       })
       .catch((err) => {
         console.log(err);
       });
}

exports.stop = (message) => {
  let { channel, text, user, username, ts, general } = message;
  reset_help_status(user);
}

function getHandle(user) {
  return new Promise((resolve, reject) => {
    slack.userdata(user) 
      .then((result) => {
        name = JSON.stringify(result.user.name);
        name = name.replace(/[^a-zA-Z0-9 ]/g, "")
        console.log();
        console.log("USER NAME: ", name)
        console.log()
        resolve(name);
        //return name;
      });
  });
};

function getGeneralChannel(token) {
  return new Promise((resolve, reject) => {
    slack.getGeneralChannel(token) 
      .then((result) => {
        general = result;
        general = general.replace(/[^a-zA-Z0-9 ]/g, "")
        general = "<#" + general + ">"
        console.log('getGeneralChannel Function: ', general);
        resolve(general);
      });
  });
};

function reset_help_status(user){
  if (!users_in_help[user]) {
    users_in_help[user] = {status: false, index: 0}
  }
  users_in_help[user].status = false;
  users_in_help[user].index = 0;
}

