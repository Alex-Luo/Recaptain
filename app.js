'use strict'

// variable setup
var _ = require('lodash');
var commands = require('./lib/commands');
var parse = require('./lib/parse');
var slack = require('slack');
var bot = slack.rtm.client();
var token = process.env.token;
bot.listen({token:token});

var users_in_convo = {};
bot.message((message) => {
 let { channel, text, user, username, team, ts } = message;

 console.log(user, text)


  const command_reg = [
    [/^recap/i, commands.recap],
    [/^help|:\shelp|:help/i, commands.help],
    [/^hi/i, commands.hi],
    [/^stop/i, commands.stop]
  ];

  let fn = null;
  for(let r of command_reg) {
    if (r[0].exec(text) != null) {
      text = text.replace(r[0], '');
      fn = r[1];
    }
  }

  message.text = text;
  if (fn) {
    fn(message, users_in_convo);
  } else if(users_in_convo[username]) {
    // call some command for the rest of the tuorial
  }
});

function openIMChannel(user){
    slack.im.open({user: user}, (err, data) => {
        // get each member of channels' direct message channel ID 
        console.log(data);
        console.log("Direct Message data: " + data.channel.id);
        if (err) reject(err);
        else resolve(data);
  });
};
