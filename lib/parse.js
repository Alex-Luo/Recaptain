var moment = require('moment');
var nlp = require('nlp-toolkit');
var _ = require('lodash');

module.exports = (text) => {
  return new Promise((resolve) => {
    let ast = {
      channels: [],
      keywords: [],
      mentions: false,
      links: false,
      date: moment().subtract(2, 'weeks')
    };

    let date = parseDate(text);
    if (date) {
      text = text.replace(date.regex, '');
      ast.date = date.date;
    }

    let channels = parseChannels(text);
    if (channels) {
        for(i=0; i <channels.length; i++) {
            text = text.replace(channels[i], '');
        }
        ast.channels = channels;
    }

    let modules = parseModules(text, ast);
    for(let m of modules) {
      text = text.replace(m[0], '');
      ast[m[1]] = true;
    }
    text += " "; 

    nlp.stopwords(nlp.tokenizer(text), { defaultLang: 'en'  })
      .then((res) => {
        ast.keywords = _.filter(text.split(/\s/i), (e) => e != '');
        resolve(ast);
     });
  });
};

function parseModules(text, ast) {
  const regexes = [
    [/links|link/i, 'links'],
    [/mentions|mention/i, 'mentions']
  ];

  let modules = [];
  for(let r of regexes) {
    let res = r[0].exec(text);
    if (res != null) {
      modules.push(r);
    }
  }

  return modules;
}

function parseDate(text) {
  const regexes = [
    [/past\s(?:hours|hour|hr|h)/i, (res) => moment().subtract(1, 'hours')],
    [/past\s(\d+)\s(?:hours|hour|hr|h)/i, (res) => moment().subtract(res[1], 'hours')],
    [/past\s(?:days|day|d)/i, (res) => moment().subtract(1, 'days').startOf('day')],
    [/past\s(\d+)\s(?:days|day|d)/i, (res) => moment().subtract(res[1], 'days').startOf('day')],
    [/yesterday/i, (res) => moment().subtract(1, 'days').startOf('day')],
    [/today/i, (res) => moment().startOf('day')],
    [/past\s(?:weeks|week|w)/i, (res) => moment().subtract(1, 'weeks').startOf('day')],
    [/past\s(\d+)\s(?:weeks|week|w)/i, (res) => moment().subtract(res[1], 'weeks').startOf('day')]
  ];

  for(let r of regexes) {
    let res = r[0].exec(text);
    if (res != null) {
      return {
        date: r[1](res),
        regex: r[0]
      };
    }
  }

  return null;
}

function parseChannels(text) {
    reg = /<#([a-zA-Z0-9]*)>/g;
    let channel_module = text.match(reg);

    return channel_module;
}
