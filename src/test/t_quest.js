import Quest from "../lib/Quest.js";
import {ch_QuestBetaAnalysis} from "../lib/VisualQuest";
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
  describe('beta analysis', () => {
    it('returns expected results after 10 trials', () => {
      // Hard codeded set of responses
      const responses = [1,1,1,0,1,1,0,0,1,1];

      const q = new Quest(
        tGuess,
        tGuessSd,
        pThreshold,
        beta,
        delta,
        gamma,
      );
      for (let i = 0; i < responses.length; i++) {
        const tTest = q.quantile();
        q.update(tTest, responses[i]);
      }

      //console.log(JSON.stringify(q));
      const analysis = ch_QuestBetaAnalysis(q);

      assert.equal(round(analysis.t, 4), -0.4730);
      assert.equal(round(analysis.sd, 4), 0.5970);
      assert.equal(round(analysis.betaEstimate, 4), 2.8788);
      assert.equal(round(analysis.betaMean, 4), 5.3339);
      assert.equal(round(analysis.betaSd, 4), 4.3329);
      assert.equal(round(analysis.iBetaMean, 4), 0.3474);
      assert.equal(round(analysis.iBetaSd, 4), 0.2457);
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

      const analysis = ch_QuestBetaAnalysis(q);
      assert.equal(round(analysis.t, 4), -0.5302);
      assert.equal(round(analysis.sd, 4), 0.2382);
      assert.equal(round(analysis.betaEstimate, 4), 3.4346);
      assert.equal(round(analysis.betaMean, 4), 5.8047);
      assert.equal(round(analysis.betaSd, 4), 4.0615);
      assert.equal(round(analysis.iBetaMean, 4), 0.2912);
      assert.equal(round(analysis.iBetaSd, 4), 0.2139);
    });
  });
});

// Test helpers
function round(x, decimalPlaces) {
  const c = Math.pow(10, decimalPlaces);
  return Math.round(x * c) / c;
}
