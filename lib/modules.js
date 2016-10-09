var _ = require('lodash');
var moment = require('moment');

exports.mentions = (messages, message, ast) => {
  return new Promise((resolve, reject) => {
    let list = _.chain(messages)
          .filter((e) => e.text.includes(message.user))
          .map((e) => "<@" + e.user + ">"  + ': ' + e.text)
          .value();

    let response = "We could not find any mentions of you.";

    if (list.length > 0) {
      response = _.join(list, '\n');
    }
    resolve(response);
  });
};

exports.links = (messages, message, ast) => {
  return new Promise((resolve, reject) => {
    let list = _.chain(messages)

          .filter((e) => e.text.includes('http'))
          .map((e) => e.text)
          .value();

    let response = "We could not find any links";

    if (list.length > 0) {
      response = _.join(list, '\n');
    }
    resolve(response);
  });
};

exports.keyword = (messages, message, keywords) => {
  return new Promise((resolve, reject) => {
    console.log("KEYWORDS", keywords);
    let list = _.chain(messages)
          .filter((e) => checkKeywords(e, keywords) && !/has joined the channel/i.test(e.text) && !/Slack for iOS Upload/i.test(e.text))    
          .sortBy((e) => e.ts)
          // .map((e) => "+ <@" + e.user + ">: " + e.text )
          // .map((e) => "> <@" + e.user + ">: " + e.text )
          // .map((e) => ":small_blue_diamond: <@" + e.user + ">: " + e.text )
          // .map((e) => "• <@" + e.user + ">: " + e.text )
          .map((e) => ":green3:  <@" + e.user + ">: " + e.text )
          // .map((e) => "<@" + e.user + ">: " + e.text + "\n\n")
          // .map((e) => {
          //   if (/uploaded a file/i.test(e.test)) {
          //     (e) => ":small_blue_diamond: " + e.text
          //   }
          //   else {
          //     (e) => ":small_blue_diamond: <@" + e.user + ">: " + e.text
          //   }
          // })
          // .map((e) => moment.duration(-((moment().unix())-e.ts), "seconds").humanize(true) + " | " + "<@" + e.user + ">: " + e.text)
          .value();

    let date_list = _.chain(messages)
          .filter((e) => checkKeywords(e, keywords) && !/has joined the channel/i.test(e.text))    
          .sortBy((e) => e.ts)
          .map((e) => moment.duration(-((moment().unix())-e.ts), "seconds").humanize(true), "TEST")
          .value();

    let response = "We could not find any messages which match " + _.join(keywords, ', ');

    console.log(list)
    console.log(date_list)

    let myMap = new Map()
    if (list.length > 0) {
      for (var i = 0; i < date_list.length; i++) {
        if (!myMap.has(date_list[i])) {
          myMap.set(date_list[i], [])
        }

        let date_entries = myMap.get(date_list[i])
        date_entries.push(list[i])
        myMap.set(date_list[i], date_entries)
        // This should work, I'm not sure why the push() function errors out.
        // myMap.set(date_list[i], myMap.get(date_list[i]).push(list[i]))
      }

      response = ""
      myMap.forEach( function(argument, key) {
        response += "*" + key + "*" + '\n' + _.join(argument, '\n') + '\n\n\n'
        // response += "____________________________________\n*" + key + "*" + '\n' + _.join(argument, '\n') + '\n\n'
      })

      console.log(myMap)
    }

    resolve(response);
  });
};

var checkKeywords = (message, keywords) =>  {
  return _.reduce(keywords, (exists, keyword) => {
	  if (!exists) {
      return message.text.toLowerCase().includes(keyword.text.toLowerCase());
	  } else {
		  return exists;
	  }
	}, false);
};
