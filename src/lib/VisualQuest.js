import Quest from "./Quest.js"
import {isArray} from 'util';

const _ = require('lodash');
const math = require('mathjs');
var fzero = require("fzero");

//   To be used within context of QUEST-like program.  Defines intensities at
//   which participants are likely to detect tone in noise at 75%
//   (threshold), 50%, 25% probabilities.  First row of returned matrix are
//   these labels.  The second gives the intensities in decibels, the third
//   in scale units (coefficient used to scale full-scaled tone).  Required
//   inputs are the QUEST structures produced by the CH QUEST procedure via
//   ch_auditory_quest. q_1 and q_2 variables are the structures produced by
//   the QUEST procedure.  t_mean is the arithmetic mean of the two threshold
//   estimates produced by the two interleaved staircases.

export function process_data(q1, q2) {
  //Statistics
  var t1 = q1.mean();		// Recommended by Pelli (1989) and King-Smith et al. (1994) as the best way to ascertain threshold.
  var t2 = q2.mean()	// Recommended by Pelli (1989) and King-Smith et al. (1994) as the best way to ascertain threshold.

  // Take the arithmetic mean of these two threshold (75%) estimates.
  var tmean = math.mean([t1, t2]);

  var lambda = 0; // normally in config file//////////////////////
  var gamma = 0.01; // normally in config file//////////////////////

  return gumbel_intensities(q1, q2, tmean, lambda, gamma);
}

export function gumbel_intensities(q1, q2, tmean, lambda, gamma) {
  var returnStruct = {
    intensities: {},
    parameters: {},
    beta: 0,
  };

  const parameters = returnStruct.parameters;
  parameters.q1 = ch_QuestBetaAnalysis(q1);
  parameters.q2 = ch_QuestBetaAnalysis(q2);

  returnStruct.parameters = parameters;

  var mean_beta = 3.5;  // changed 3/25/2019. Trying fixed beta at 3.5 (suggested generic beta value by Quest documentation) instead of individually estimating.
  var mean_alpha = tmean;
  var estimate_beta = math.mean(q1.params.beta, q2.params.beta);
  returnStruct.beta = estimate_beta;

  const makeFn = (val) => {
    return (x) => {
      return (PAL_Gumbel(mean_alpha, mean_beta, gamma, lambda, x) - val).toString();
    }
  }

  const intensities = returnStruct.intensities;
  intensities.c25 = parseFloat(fzero(makeFn(0.25), 2).solution);
  intensities.c50 = parseFloat(fzero(makeFn(0.50), 2).solution);
  intensities.c75 = parseFloat(fzero(makeFn(0.75), 2).solution);
  intensities.c90 = parseFloat(fzero(makeFn(0.90), 2).solution);

  return returnStruct;
}

export function ch_QuestBetaAnalysis(q) {
  var q2 =  new Quest(
    q.params.tGuess,
    q.params.tGuessSd,
    q.params.pThreshold,
    Math.pow(2, 1/4),
    q.params.delta,
    q.params.gamma,
    0.02 // grain
  );
  q2.params.dim = 250;
  q2.recompute();

  // Sanity check
  if (_.sum(q2.params.pdf) == 0) {
    throw new Error("Beta has zero probability");
  }

  var t2 = q2.mean(); // estimate threshold for each possible beta
  var p2 = q2.pdf(t2); // get probability of each of these (threshold,beta) combinations
  var beta2 = q2.params.beta;

  var modeP = p2;
  var t = t2;
  // Below values are never used?
//  var betaMean = math.sum(p2 * beta2) / modeP;
//  var betaSd = math.sqrt(math.sum(p2 * math.pow(beta2, 2)) / modeP - math.pow((math.sum(p2 * beta2)/ modeP), 2));

  var iBetaMean = math.sum(p2 / beta2) / modeP;
  var iBetaSd = math.sqrt(math.sum(p2 / math.pow(beta2, 2)) / modeP - math.pow((math.sum(p2/beta2) / modeP), 2));
  var betaEstimate = 1 / iBetaMean;

  var returnStruct = {
    t: t,
    sd: q2.sd(),
    betaEstimate: betaEstimate,
    iBetaSd: iBetaSd,
  };

  return returnStruct;
}

// varargin is optional
export function PAL_Gumbel(alpha, beta, gamma, lambda, x, varargin) {
  if (_.isUndefined(varargin)) {
    const f = (t) => {
      return math.eval(gamma + "+ ( 1 - " + gamma + " - " + lambda + ") * ( 1 - e^(-1 * 10^(" + beta + "* (" + t + "-" + alpha + "))))");
    };
    return isArray(x) ? x.map(f) : f(x);
  } else if (varargin === 'Inverse') {
    const f = (t) => {
      var c = math.eval( "(" + t + "-" + gamma + " ) / (1 - " + gamma + "-" + lambda + ") - 1");
      c = math.eval("-1 * log( -1 * " + c + ")");
      c = math.eval( "log10( " + c + ")");
      c = math.divide(c, 2);
      return math.add(alpha, c);
    };
    return isArray(x) ? x.map(f) : f(x);
  } else if (varargin === 'Derivative') {
    const f = (t) => {
      return math.eval("( 1 - " + gamma + " - " + lambda + ") * e^(-1 * 10^(" + beta + "* (" + x + "-" + alpha + "))) * log(10) * 10^( " + beta + "*(" + x + "-" + alpha + "))*" + beta);
    };
    return isArray(x) ? x.map(f) : f(x);
  } else {
    throw new Error("Invalid varargin: ", varargin);
  }
}
