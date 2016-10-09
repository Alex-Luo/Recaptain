var modules = require('../lib/modules');
var should = require('should');

describe('Module Tests', () => {
  describe('Keywords', () => {
    const messages = [
      {

        text: 'foxden is really cool',
        user: 'JON'
      },
      {

        text: 'pineapple',
        user: 'JON'
      },
      {

        text: 'frosty pineapples',
        user: 'JON'
      }
    ];

    const toArray = (result) => result.split('\n');

    it('One message', () => {
      return modules.keyword(messages, null, { keywords: ['foxden'] })
        .then(toArray)
        .then((result) => {
          result.length.should.equal(1);
        });
    });

    it('Two message', () => {
      return modules.keyword(messages, null, { keywords: ['pineapple'] })
        .then(toArray)
        .then((result) => {
          result.length.should.equal(2);
        });
    });
  });
});

