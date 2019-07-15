import {
  sumVector,
  QuestPdf,
  QuestRecompute,
  QuestCreate,
  QuestMean,
  QuestSd,
  QuestQuantile,
  QuestUpdate,
  PAL_Gumbel,
  indexOfMax
} from "./Quest.js"

export function test() {
    const math = require('mathjs');

    var tGuess = 0.5,
      tGuessSd = 0.1,
      pThreshold = 0.75,
      beta = 3.5,
      delta = 0.01,
      gamma = 0.01,
      grain = 0.001,
      range = .05;
    var q1 = QuestCreate(tGuess, tGuessSd, pThreshold, beta, delta, gamma, grain, range);

    //console.log(q1);
    var q2 = QuestCreate(tGuess, tGuessSd, pThreshold, beta, delta, gamma, grain, range);
    q2.updatePdf = 1;
    q2 = QuestUpdate(q2, 0.5, 1);
    console.log(q2)
    var t1 = QuestMean(q1);		// Recommended by Pelli (1989) and King-Smith et al. (1994) as the best way to ascertain threshold.
    var sd1 = QuestSd(q2);

    var t2 = QuestMean(q2);		// Recommended by Pelli (1989) and King-Smith et al. (1994) as the best way to ascertain threshold.
    var sd2 = QuestSd(q2);

    // Take the arithmetic mean of these two threshold (75%) estimates.
    var tmean = math.mean([t1, t2]);
    var sdmean = math.mean([sd1, sd2]);

    console.log(t1, sd1, t2, sd2, tmean, sdmean);
}

//   To be used within context of QUEST-like program.  Defines intensities at
//   which participants are likely to detect tone in noise at 75%
//   (threshold), 50%, 25% probabilities.  First row of returned matrix are
//   these labels.  The second gives the intensities in decibels, the third
//   in scale units (coefficient used to scale full-scaled tone).  Required
//   inputs are the QUEST structures produced by the CH QUEST procedure via
//   ch_auditory_quest. q_1 and q_2 variables are the structures produced by
//   the QUEST procedure.  t_mean is the arithmetic mean of the two threshold
//   estimates produced by the two interleaved staircases.

export function process_data( q1, q2 ) {
    const math = require('mathjs');

    //Statistics
    var t1 = QuestMean(q1);		// Recommended by Pelli (1989) and King-Smith et al. (1994) as the best way to ascertain threshold.
    var sd1 = QuestSd(q1);

    var t2 = QuestMean(q2);		// Recommended by Pelli (1989) and King-Smith et al. (1994) as the best way to ascertain threshold.
    var sd2 = QuestSd(q2);

    // Take the arithmetic mean of these two threshold (75%) estimates.
    var tmean = math.mean([t1, t2]);
    var sdmean = math.mean([sd1, sd2]);

    var lambda = 0; // normally in config file//////////////////////
    var gamma = 0.01; // normally in config file//////////////////////

    var intensities = gumbel_intensities(q1, q2, tmean, lambda, gamma);

    return intensities;
}

export function gumbel_intensities(q1, q2, tmean, lambda, gamma) {
    var returnStruct = {
        intensities: [],
        parameters: [],
        beta: 0,
    }

    var intensities = []
    intensities.push( [ 25, 50, 75, 90 ] );
    intensities.push( [] );

    const math = require('mathjs');

    var parameters = [];

    parameters.push(ch_QuestBetaAnalysis(q1));
    parameters.push(ch_QuestBetaAnalysis(q2));

    returnStruct.parameters = parameters;

    var mean_beta = 3.5;  // changed 3/25/2019. Trying fixed beta at 3.5 (suggested generic beta value by Quest documentation) instead of individually estimating.
    var mean_alpha = tmean;
    var estimate_beta = math.mean(q1.beta, q2.beta);
    returnStruct.beta = estimate_beta;

    var fzero = require("fzero");

    var fn90 = function (x) { return( PAL_Gumbel(mean_alpha, mean_beta, gamma, lambda, x) - 0.90 ).toString(); };
    var fn75 = function (x) { return( PAL_Gumbel(mean_alpha, mean_beta, gamma, lambda, x) - 0.75 ).toString(); };
    var fn50 = function (x) { return( PAL_Gumbel(mean_alpha, mean_beta, gamma, lambda, x) - 0.50 ).toString(); };
    var fn25 = function (x) { return ( PAL_Gumbel(mean_alpha, mean_beta, gamma, lambda, x) - 0.25).toString();  };

    var zero = fzero(fn25, 2).solution;
    //var zero = PAL_Gumbel(mean_alpha, mean_beta, gamma, lambda, 0);
    intensities[1].push( parseFloat(fzero(fn25, 2).solution) );
    intensities[1].push( parseFloat(fzero(fn50, 2).solution) );
    intensities[1].push( parseFloat(fzero(fn75, 2).solution) );
    intensities[1].push( parseFloat(fzero(fn90, 2).solution) );
    intensities.push(intensities[1]);

    returnStruct.intensities = intensities;

    return returnStruct;
  }

export function ch_QuestBetaAnalysis(q) {
    const math = require('mathjs');

    var q2 =  QuestCreate( q.tGuess, q.tGuessSd, q.pThreshold, math.eval("2^(1/4)"), q.delta, q.gamma, 0.02);
    q2.dim = 250;

    var qq = QuestRecompute( q2 );
    var p = sumVector(qq.pdf);


    if( p == 0 ){
        throw new Error("Beta has zero probability, ", p);
    }

    q2 = qq;

    var t2 = QuestMean( q2 ); // estimate threshold for each possible beta
    var p2 = QuestPdf( q2, t2 ); // get probability of each of these (threshold,beta) combinations
    var sd2 = QuestSd( q2 ); // get sd of threshold for each possible beta
    var beta2 = q2.beta;


    var modeP = p2;
    var t = t2;
    var sd = QuestSd(q2);
    var betaMean = math.sum(p2 * beta2) / modeP;
    var betaSd = math.sqrt(math.sum(p2 * math.pow(beta2, 2)) / modeP - math.pow((math.sum(p2 * beta2)/ modeP), 2));

    var iBetaMean = math.sum( p2 / beta2) / modeP;
    var iBetaSd = math.sqrt(math.sum(p2 / math.pow(beta2, 2)) / modeP - math.pow((math.sum(p2/beta2) / modeP), 2));
    var betaEstimate = 1 / iBetaMean;

    var returnStruct = {
        t: t,
        sd: sd,
        betaEstimate: betaEstimate,
        iBetaSd: iBetaSd,
    }

    return returnStruct
}
