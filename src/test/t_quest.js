import Quest from "../lib/Quest.js";
var assert = require('assert');

// Test parameters
const tActual = -2;
const tGuess = -1,
  tGuessSd = 2,
  pThreshold = 0.82,
  beta = 3.5,
  delta = 0.01,
  gamma = 0.5;

describe('Quest', () => {
  describe('mean and sd', () => {
    it('returns expected results after 10 trials', () => {
      // Hard codeded set of responses
      const responses = [1,1,1,0,1,1,0,0,1,1];

      const q = new Quest(
        tGuess,
        tGuessSd,
        pThreshold,
        beta,
        delta,
        gamma
      );

      for (let i = 0; i < responses.length; i++) {
        const tTest = q.quantile();
        q.update(tTest, responses[i]);
      }

      assert.equal(round(q.mean(), 4), -0.4149);
      assert.equal(round(q.sd(), 4), 0.5802);
    });

    it('returns expected results after 20 trials', () => {
      // Hard coded set of responses
      const responses = [1,1,1,0,1,1,0,0,1,1,1,1,1,0,1,0,1,1,1,1];

      const q = new Quest(
        tGuess,
        tGuessSd,
        pThreshold,
        beta,
        delta,
        gamma
      );

      for (let i = 0; i < responses.length; i++) {
        const tTest = q.quantile();
        q.update(tTest, responses[i]);
      }

      assert.equal(round(q.mean(), 4), -0.5256);
      assert.equal(round(q.sd(), 4), 0.2406);
    });
  });
});

// Test helpers
function round(x, decimalPlaces) {
  const c = Math.pow(10, decimalPlaces);
  return Math.round(x * c) / c;
}
