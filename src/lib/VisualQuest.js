import Quest from "./Quest.js"
import {isArray} from 'util';
var assert = require('assert');

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
  let qq = [];
  for (let i = 1; i <= 16; i++) {
    const q2 = _.cloneDeep(q);
    // Norming should be done across all pdfs;
    // to simplify, we skip norming.
    q2.params.normalizePdf = 0;
    q2.params.beta = Math.pow(2, i/4);
    q2.params.dim = 250;
    q2.params.grain = 0.02;
    q2.recompute();
    qq.push(q2);
  }

  //console.log(JSON.stringify(qq[0]));
  // Omit betas that have zero probability
  qq = _.filter(qq, (q) => _.sum(q.params.pdf) !== 0);

  // Get most probable combination
  let maxP = qq[0].pdf(qq[0].mean()), index = 0;
  const allP = [maxP];
  const allBeta = [qq[0].params.beta];
  const allT = [qq[0].mean()];
  for (let i = 1; i < qq.length; i++) {
    const p2 = qq[i].pdf(qq[i].mean());
    allP.push(p2);
    allBeta.push(qq[i].params.beta);
    allT.push(qq[i].mean());

    if (p2 > maxP) {
      maxP = p2;
      index = i;
    }
  }

  const probableQ = qq[index];
//  assert.equal(allBeta[index], 1);
  const sd = probableQ.sd();
  const p = _.sum(allP);
  const t = probableQ.mean();

  const multVector = _.map(
    _.range(allP.length), (i) => allP[i] * allBeta[i]
  );
  const multVectorBetaSqured = _.map(
    _.range(allP.length), (i) => allP[i] * Math.pow(allBeta[i],2)
  );
  const betaMean = _.sum(multVector) / p;
  const betaSd = math.sqrt(_.sum(multVectorBetaSqured)/p - Math.pow(_.sum(multVector)/p,2));

  const divVector = _.map(
    _.range(allP.length), (i) => allP[i] / allBeta[i]
  );
  const divVectorBetaSquared = _.map(
    _.range(allP.length), (i) => allP[i] / Math.pow(allBeta[i],2)
  );
  const iBetaMean = _.sum(divVector) / p;
  const iBetaSd = math.sqrt(_.sum(divVectorBetaSquared)/p - Math.pow(_.sum(divVector)/p,2));

  const betaEstimate = 1 / iBetaMean;
//console.log(JSON.stringify(qq[0]));
  return {
    t: t,
    sd: sd,
    betaEstimate: betaEstimate,
    betaMean: betaMean,
    betaSd: betaSd,
    iBetaMean: iBetaMean,
    iBetaSd: iBetaSd,
  };
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


function multiplyVector(a,b){
  return a.map((e,i) => e * b[i]);
}
