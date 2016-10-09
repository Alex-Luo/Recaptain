var slack = require('../lib/slack');
var moment = require('moment');


describe('Slack API tests', () => {
  it.skip('channel.history', () => {
    return slack.history("C0AS7C51D", moment().subtract(1, 'week'))
      .then((result) => {
        console.log(result.length);
      });
  });
});
