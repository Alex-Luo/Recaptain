var should = require('should');
var parse = require('../lib/parse');
var moment = require('moment');

describe('Parser Tests', () => {
  describe('Date Extractor', () => {
    describe('Hour', () => {
      const current_hour = moment().subtract(1, 'hours').hours();

      it('hour with number', () => {
        return parse('foxden 1 hour')
          .then((result) => {
            result.date.hours().should.equal(current_hour);
          });
      });

      it('hour with past keyword', () => {
        return parse('with foxden and closed one from the past hour')
          .then((result) => {
            result.date.hours().should.equal(current_hour);
          });
      });
    });

    describe('Day', () => {
      const current_day = moment().subtract(1, 'days').days();

      it('day with number', () => {
        return parse('foxden 1 day')
          .then((result) => {
            result.date.days().should.equal(current_day);
          });
      });

      it('day with past keyword', () => {
        return parse('foxden past day')
          .then((result) => {
            result.date.days().should.equal(current_day);
          });
      });
    });

    describe('Week', () => {
      const current_week = moment().subtract(1, 'weeks').days();

      it('week with number', () => {
        return parse('foxden 1 week')
          .then((result) => {
            result.date.days().should.equal(current_week);
          });
      });

      it('week with past keyword', () => {
        return parse('foxden past week')
          .then((result) => {
            result.date.days().should.equal(current_week);
          });
      });
    });
  });

  describe('Module Extractor', () => {
    it('Links Single', () => {
      return parse('foxden links')
        .then((result) => {
          result.links.should.be.true;
          result.mentions.should.be.false;
        });
    });

    it('Mentions single', () => {
      return parse('foxden mentions')
        .then((result) => {
          result.mentions.should.be.true;
          result.links.should.be.false;
        });
    });

    it('Mentions and Links', () => {
      return parse('foxden mentions and links')
        .then((result) => {
          result.mentions.should.be.true;
          result.links.should.be.true;
        });
    });
  });
  describe('Keyword Extractor', () => {
    it("keyword", () => {
    return parse('recap #general asdf')
      .then((result) => {
        result.keywords.should.be.asdf;
      });
    });
  });
});
