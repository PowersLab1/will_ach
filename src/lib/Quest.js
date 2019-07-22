const _ = require('lodash');
const math = require('mathjs');

class Quest {
  constructor(
    tGuess,
    tGuessSd,
    pThreshold,
    beta,
    delta,
    gamma,
    grain = 0.01,
    range) {
      let num_args = arguments.length;
      let dim = 0;

      if (num_args < 8 || _.isEmpty(range)) {
          dim = 500;
      } else {
          if (range <= 0) {
              throw new Error("Range must be greater than 0");
          }
          dim = range / grain;
          dim = 2 * Math.ceil(dim / 2);
      }

      // Double check here if there are number errors
      // TODO: Use helper function here
      // Finite or real?
      if (!isFinite( tGuess ) || isNaN( tGuess )) {
          throw new Error( "tGuess must be real and finite" );
      }

      this.params = makeQ(
        tGuess,
        tGuessSd,
        pThreshold,
        beta,
        delta,
        gamma,
        grain,
        dim
      );

      this.recompute();
  }

  recompute() {
      const q = this.params;

      //if the struct contains more than one struct as an array then you must set normalizePdf of each to 0.
      if (!q.updatePdf) {
          return;
      }

      if (q.gamma > q.pThreshold) {
        console.log("Reducing gamma from %.2f to 0.5");
        q.gamma = 0.5;
      }

      q.i = [];
      q.x = [];
      q.x2 = [];
      q.p2 = [];
      q.s2 = []; //have to make an array of arrays due to lack of multidimensional array support

      for (let i = -q.dim/2; i <= q.dim/2; i++){
          q.i.push(i);
      };

      q.x = q.i.map((x) => x * q.grain);

      let tempA = q.x.map((x) => x / q.tGuessSd);
      let tempB = tempA.map((x) => Math.pow(x, 2));

      q.pdf = tempB.map((x) => Math.exp(x * -0.5));
      q.pdf = normalize(q.pdf);

      let i2 = [];
      for (let i = -q.dim; i <= q.dim; i++){
          i2.push(i);
      }
      q.x2 = i2.map((x) => x * q.grain);
      tempA = q.x2.map((x) => x * q.beta);

      q.p2 = tempA.map((x) =>
          math.eval(q.delta + "*" + q.gamma + "+ ( 1 -" + q.delta + " ) * ( 1 - ( 1-" + q.gamma + ") * e^(-10 ^ " + x + "))")
      );

      if (Math.min(_.first(q.p2), _.last(q.p2)) > q.pThreshold
        || Math.max(_.first(q.p2), _.last(q.p2)) < q.pThreshold) {
          throw new Error('psychometric function range ['
            + Math.min.apply( null, q.p2 )
            + " "
            +  Math.max.apply( null, q.p2 )
            + ' ] omits '
            + q.pThreshold
            + ' threshold'
          );
      }

      var linear = require('everpolate').linear;
      q.xThreshold = linear( q.pThreshold , q.p2, q.x2);

      for (let i = 0; i < q.p2.length; i++){
          if(!isFinite(q.p2[i])){
              throw new Error( 'psychometric function p2 is not finite' + i);
          }
      }

      q.p2 = q.x2.map((x) =>
        math.eval(q.delta + "*" + q.gamma + "+ ( 1 -" + q.delta + " ) * ( 1 - ( 1-" + q.gamma +") * e^(-10 ^ (" + q.beta + "* (" + x + "+" + q.xThreshold + "))))")
      );

      let tempC = _.clone(q.p2).reverse();
      let array1 = tempC.map((x) => 1 - x);
      let array2 = tempC;

      q.s2[0] = array1;
      q.s2[1] = array2;

      if (_.isEmpty(q.intensity) || _.isEmpty(q.response)) {
          q.trialCount = 0;
          q.intensity = _.fill(Array(100), 0);
          q.response = _.fill(Array(100), 0);
      }

      for (let k = 0; k < q.s2.length; k++){
          for (let i = 0; i < q.s2[k].length; i++){
              if (!isFinite(q.s2[k][i])){
                  throw new Error( 'psychometric function s2 is not finite' + i);
              }
          }
      }

      let pL = _.first(q.p2);
      let pH = _.last(q.p2);
      let pE = pH * Math.log(pH + Number.EPSILON)
        - pL * Math.log(pL + Number.EPSILON)
        + (1 - pH + Number.EPSILON) * Math.log(1 - pH + Number.EPSILON)
        - (1 - pL + Number.EPSILON) * Math.log(1 - pL + Number.EPSILON);
      pE = 1 / (1 + Math.exp(pE / ( pL - pH)));
      q.quantileOrder = (pE - pL) / (pH - pL);

      for (let j = 0; j < q.pdf.length; j++){
          if (!isFinite(q.pdf[j])) {
              throw new Error( 'prior pdf is not finite');
          }
      }

      for (let k = 0; k < q.trialCount; k++){
        const inten = Math.max(-1e10, Math.min(1e10, q.intensity[k]));
        let ii = q.i.map((x) =>  q.pdf.length + x - Math.round((inten - q.tGuess) / q.grain));

        if (ii[0] < 1) {
          ii = ii.map((x) => x + 1 - ii[0]);
        }

        if (_.last(ii) > q.s2[0].length) {
          ii = ii.map((x) => x + q.s2[0].length - _.last(ii));
        }

        for (let i = 0; i < ii.length; i++) {
            q.pdf[i] = q.pdf[i] * q.s2[q.response[k]][ii[i] - 1];
        }

    		if (q.normalizePdf && k % 100 == 0){
          q.pdf = normalize(q.pdf);
        }
      }

      if (q.normalizePdf) {
        q.pdf = normalize(q.pdf);  //avoid underflow; keep the pdf normalized // 3 ms
      }

      for (let i = 0; i < q.pdf.length; i++) {
        if (!isFinite(q.pdf[i])) {
            throw new Error( 'pdf is not finite');
        }
      }
  }

  update(intensity, response) {
      const q = this.params;

      // Use helper here?
      if (!isFinite( intensity ) || isNaN(intensity)) {
          throw new Error( "Intensity must be real, not complex"); // what???
      }

      if (response < 0 || response >= q.s2.length){
          throw new Error( "response " + response + " is out of range 0 to " + q.s2.length);
      }

      if (q.updatePdf) {
          const inten = Math.max(-1e10, Math.min(1e10, intensity));
          let ii = q.i.map((x) =>  q.pdf.length + x - Math.round((inten - q.tGuess) / q.grain));

          if (ii[0] < 1 || _.last(ii) > q.s2[0].length) {
              if (q.warnPdf) {
                  const low = (1 - q.pdf.length - q.i[0]) * q.grain + q.tGuess;
                  const high = (q.s2[0].length - q.pdf.length - _.last(q.i)) * q.grain + q.tGuess;
                  alert('QuestUpdate: intensity ' + inten + ' out of range ' + low + ' to ' + high + '. Pdf will be inexact. Suggest that you increase "range" in call to QuestCreate.');
              }
              if (ii[0] < 1) {
                  ii = ii.map((x) => x + 1 - ii[0]);
              } else {
                  ii = ii.map((x) => x + q.s2[0].length - _.last(ii));
              }
          }

          for (let i = 0; i < ii.length; i++) {
              q.pdf[i] = q.pdf[i] * q.s2[response][ii[i] - 1];
          }

          if (q.normalizePdf) {
              q.pdf = normalize(q.pdf); //avoid underflow; keep the pdf normalized // 3 ms
          }
      }

      // keep a historical record of the trials
      q.trialCount += 1;

      // Out of space in preallocated arrays. Reallocate for additional
      // 100 trials. We reallocate in large chunks to reduce memory
      // fragmentation.
      if (q.trialCount > q.intensity.length) {
          q.intensity = [...q.intensity, ..._.fill(Array(100), 0)];
          q.response = [...q.response, ..._.fill(Array(100), 0)];
      }

      q.intensity[q.trialCount - 1] = intensity;
      q.response[q.trialCount - 1] = response;
  }

  trials(binsize=0) {
    const q = this.params;

    if (!isFinite(binsize)){
      throw new Error('binsize must be finite');
    }

    if (binsize < 0 ){
      throw new Error('binsize cannot be negative');
    }

    // Sort
    var inIntensity = q.intensity.slice(0, q.trialCount + 1);
    var inResponse = q.response.slice(0, q.trialCount + 1);
    const withIndex = _.map(inIntensity, (v,i) => [v,i]);
    const sorted = _.sortBy(withIndex, 0);

    var indexes = [];
    var intensity = [];
    for (const j in sorted) {
        intensity.push(sorted[j][0]);
        indexes.push(sorted[j][1]);
    }

    var response = [];
    for (let i = 0; i < indexes.length; i++){
        response.push(inResponse[indexes[i]]);
    }

    //quantize
    if (binsize > 0){
        intensity = intensity.map((x) => Math.round( x / binsize ) * binsize);
    }

    // compact

    var trial = {
        intensity: [],
        responses: [],
    };

    trial.intensity.push(intensity[0]);

    for (let i = 0; i < 2; i++){
        trial.responses[i] = [0];
    }

    let j = 0;
    for (let i = 0; i < intensity.length; i++) {
        if (intensity[i] != trial.intensity[j]) {
            j += 1;
            trial.intensity.push(intensity[i]);
            for(i = 0; i < 2; i++){
                trial.responses[i].push(0);
            }
        }
        trial.responses[response[i]][j] = trial.responses[response[i]][j] + 1;
    }

    return trial;
  }

  simulate(tTest, tActual) {
    const q = this.params;

    var linear = require('everpolate').linear;

    const x2min = Math.min(_.first(q.x2), _.last(q.x2));
    const x2max = Math.max(_.first(q.x2), _.last(q.x2));
    const t = Math.min(Math.max((tTest - tActual), x2min) , x2max);
    const response = linear(t, q.x2, q.p2) > Math.random() ? 1 : 0;

    return response;
  }

  //t=QuestMean(q)
  //Get the mean threshold estimate.
  mean() {
    const q = this.params;
    const sumPDF = _.sum(q.pdf);
    const tempA = _.sum(multiplyVector(q.pdf, q.x));

    return q.tGuess + tempA / sumPDF;	// mean of our pdf
  }

  mode() {
    const q = this.params;
    const index = indexOfMax(q.pdf);
    return q.x[index] + q.tGuess;
  }


  //sd=QuestSd(q)
  //Get the sd of the threshold distribution.
  sd() {
    const q = this.params;

    const p = _.sum( q.pdf );
    const xSquared = q.x.map((x) => Math.pow(x, 2));
    const squared2 = _.sum(multiplyVector(q.pdf, q.x)) / p;

    const sd = Math.sqrt((_.sum(multiplyVector(q.pdf, xSquared)) / p) - Math.pow(squared2, 2)) ;
    return sd;
  }

  //p=QuestPdf(q,t)
  // The (possibly unnormalized) probability density of candidate threshold "t".
  // q and t may be vectors of the same size, in which case the returned p is a vector of that size.
  pdf(t) {
    const q = this.params;
    var i = Math.round((t - q.tGuess) / q.grain) + 1 + q.dim / 2;
    i = Math.min(q.pdf.length, Math.max(1 , i));
    return q.pdf[i - 1];
  }

  // p=QuestP(q,x)
  // The probability of a correct (or yes) response at intensity x, assuming
  // threshold is at x=0.
  p(x) {
    const q = this.params;

    if(!isReal(x)) {
      throw new Error('x must be real, not complex.');
    }

    let result;

    if (x < q.x2[0]) {
      result = q.p2[0];
    } else if (x > _.last(q.x2)) {
      result = _.last(q.p2)
    } else {
      var linear = require('everpolate').linear;
      result = linear(0, q.x2, q.p2)[0];
    }

    if (!isFinite(result)) {
        throw new Error('psychometric function ' + result + ' at ' + x);
    }

    return result;
  }

  // intensity=QuestQuantile(q,[quantileOrder])
  //  Gets a quantile of the pdf in the struct q. You may specify the desired
  //  quantileOrder, e.g. 0.5 for median, or, making two calls, 0.05 and 0.95
  //  for a 90% confidence interval. If the "quantileOrder" argument is not
  //  supplied, then it's taken from the "q" struct. QuestCreate uses
  //  QuestRecompute to compute the optimal quantileOrder and saves that in the
  //  "q" struct; this quantileOrder yields a quantile  that is the most
  //  informative intensity for the next trial.
  quantile(quantileOrder) {
    const q = this.params;

    if (_.isUndefined(quantileOrder)) {
      quantileOrder = q.quantileOrder;
    }

    if (quantileOrder > 1 || quantileOrder < 0) {
      throw new Error('quantileOrder' + quantileOrder + ' is outside range 0 to 1.');
    }

    var p = cumsum(q.pdf);

    if (!isFinite(_.last(p))) {
        throw new Error('pdf is not finite');
    }

    if (_.last(p) == 0) {
        throw new Error('pdf is all zero');
    }

    if (quantileOrder < p[0]) {
        return q.tGuess + q.x[0];
    }
    if (quantileOrder > _.last(p)) {
        return q.tGuess + _.last(q.x);
    }

    var tempP = p.slice();
    tempP.unshift(-1);

    let tempA = diff(tempP);
    var index = findZero(tempA);

    if (index.length < 2) {
	    throw new Error('pdf has only ' + index.length + ' nonzero point(s)');
    }

    var linear = require('everpolate').linear;
    var temp1 = subarrayIndex(p, index);
    var temp2 = subarrayIndex(q.x, index);

    return q.tGuess + (linear(quantileOrder * _.last(p), temp1, temp2)[0]);
  }
} // end Quest

export default Quest;

/*************************
 *                       *
 *        Helpers        *
 *                       *
 *************************/

//helper function to QuestCreate which makes a new Q structure
export function makeQ(
    tGuess,
    tGuessSd,
    pThreshold,
    beta,
    delta,
    gamma,
    grain,
    dim) {

    return {
        updatePdf: 1, //boolean: 0 for no, 1 for yes
        warnPdf: 1,  //boolean
        normalizePdf: 1,  //boolean. This adds a few ms per call to QuestUpdate, but otherwise the pdf will underflow after about 1000 trials.
        tGuess: tGuess,
        tGuessSd: tGuessSd,
        pThreshold: pThreshold,
        xThreshold: 0,
        beta: beta,
        delta: delta,
        gamma: gamma,
        grain: grain,
        dim: dim,
        i: [],
        x: [],
        x2: [],
        p2: [],
        s2: [], //have to make an array of arrays due to lack of multidimensional array support
        intensity: [],
        response: [],
        trialCount: 0,
        quantileOrder: 0,
    };
}

function subarrayIndex( arr, indices ) {
  return _.map(indices, (index) => arr[index]);
}

function findZero(arr) {
  var nonzeroIndices = _.map(arr, (v, k) => v > 0 ? k : -1);
  return _.filter(nonzeroIndices, (k) => k >= 0);
}

function diff(arr) {
  const deltas = _.map(arr, (v, k) => k > 0 ? arr[k] - arr[k-1] : 0);
  deltas.shift();
  return deltas;
}

export function cumsum(arr) {
  var new_array = [];
  arr.reduce((a,b,i) => new_array[i] = a + b, 0);
  return new_array;
}

function multiplyVector(a,b){
  return a.map((e,i) => e * b[i]);
}

export function indexOfMax(arr) {
  if (arr.length === 0) {
      return -1;
  }
  const maxVal = _.max(arr);
  return arr.indexOf(maxVal);
}

function isReal( x ){
  return !isNaN(x);
}

function normalize(arr) {
  const sum = _.sum(arr);
  return _.map(arr, (x) => x / sum);
}
