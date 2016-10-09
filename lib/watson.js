var watson = require('watson-developer-cloud');

var alchemy_language = watson.alchemy_language({
  api_key: '45bba4b87a8fabf426d4f9d83fc4443375cf1bac'
});

exports.get_keywords = get_keywords = (text) => {
  return new Promise((resolve, reject) => {
    let params = {
      text
    };

    if (!params.text) {
      reject("No messages to recap");
    } else {
      alchemy_language.keywords(params, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    }
  });
};
