import { isArray } from 'util';

const _ = require('lodash');

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

//Creates a new Q structure for QUEST algorithms with parameters: tGuess, tGuessSd, pThreshold, beta, delta, gamma, grain, range
export function QuestCreate(
    tGuess,
    tGuessSd,
    pThreshold,
    beta,
    delta,
    gamma,
    grain = 0.01,
    range = 5,
    plotIt = 0) {

    let num_args = arguments.length;
    let dim = 0;

    if (num_args < 6){
        throw new Error("Incorrect number of arguments");
    }

    if (num_args < 8 || _.isEmpty(range)) {
        dim = 500;
    } else {
        if (range <= 0) {
            throw new Error("Range must be greater than 0");
        }
        dim = range / grain;
        dim = 2 * Math.ceil( dim / 2 );
    }


    // Double check here if there are number errors
    // TODO: Use helper function here
    if( !(isFinite( tGuess )) || (isNaN( tGuess )) ){
        throw new Error( "tGuess must be real and finite" );
    }

    var newQ = makeQ(
      tGuess,
      tGuessSd,
      pThreshold,
      beta,
      delta,
      gamma,
      grain,
      dim
    );

    return QuestRecompute(newQ, plotIt);
}

export function QuestRecompute(q, plotIt = 0) {

    const math = require('mathjs');

    if( arguments.length < 1 ){
        throw new Error("Usage: QuestRecompute( q, plotIt = 0 )");
    }

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


    for (var i = -q.dim/2; i <= q.dim/2; i++){
        q.i.push(i);
    };

    q.x = q.i.map((x) => x * q.grain);

    let tempA = q.x.map((x) => x / q.tGuessSd);
    let tempB = tempA.map((x) => Math.pow(x, 2));

    q.pdf = tempB.map((x) => Math.exp(x * -0.5));
    let sumPDF = sumVector(q.pdf);
    q.pdf = q.pdf.map((x) => x / sumPDF);


    let i2 = [];
    for( i = -q.dim; i <= q.dim; i++){
        i2.push(i);
    }
    q.x2 = i2.map( function( x ) {return (math.eval(x + "*" + q.grain));});

    tempA = q.x2.map( function( x ) { return (math.eval(x + "*" + q.beta)); });

    q.p2 = tempA.map( function( x ) {
        return ( math.eval( q.delta + "*" + q.gamma + "+ ( 1 -" + q.delta + " ) * ( 1 - ( 1-" + q.gamma +") *" + "e^(-10 ^ " + x + "))"));
    });

    if( Math.min(q.p2[0], q.p2[q.p2.length - 1]) > q.pThreshold || Math.max(q.p2[0], q.p2[q.p2.length - 1]) < q.pThreshold){
        throw new Error( 'psychometric function range [' + Math.min.apply( null, q.p2 ) + " " +  Math.max.apply( null, q.p2 ) + ' ] omits ' + q.pThreshold + ' threshold');
    }

    var linear = require('everpolate').linear;
    q.xThreshold= linear( q.pThreshold , q.p2, q.x2);

    for(var i = 0; i < q.p2.length; i++){
        if(!isFinite(q.p2[i])){
            throw new Error( 'psychometric function p2 is not finite' + i);
        }
    }

    q.p2 = q.x2.map( function ( x ){
        return( math.eval( q.delta + "*" + q.gamma + "+ ( 1 -" + q.delta + " ) * ( 1 - ( 1-" + q.gamma +") *" + "e^(-10 ^ (" + q.beta + "* (" + x + "+" + q.xThreshold + "))))"));
    } );


    let tempC = q.p2.slice();
    tempC = tempC.reverse();
    let array1 = tempC.map((x) => 1 - x);
    let array2 = tempC;

    q.s2[0] = array1;
    q.s2[1] = array2;

    if( q.intensity.length == 0 || q.response.length  == 0 ){
        let arrayZero = new Array(10000).fill(0);
        q.trialCount = 0;
        q.intensity = arrayZero;
        q.response = arrayZero;
    }


    for( var k = 0; k < q.s2.length; k++){
        for( i = 0; i < q.s2[k].length; i++){
            if(!isFinite(q.s2[k][i])){
                throw new Error( 'psychometric function s2 is not finite' + i);
            }
        }
    }

    let pL = q.p2[0];
    let pH = q.p2[q.p2.length - 1];
    let pE = pH * Math.log(pH + Number.EPSILON)
      - pL * Math.log( pL+Number.EPSILON )
      + (1 - pH + Number.EPSILON) * Math.log( 1 - pH + Number.EPSILON)
      - (1 - pL + Number.EPSILON) * Math.log( 1 - pL + Number.EPSILON);
    pE = 1 / (1 + Math.exp( pE / ( pL - pH)));
    q.quantileOrder= ( pE - pL ) / ( pH - pL);

    for(var j = 0; j < q.pdf.length; j++){
        if(!isFinite(q.pdf[j])){
            throw new Error( 'prior pdf is not finite');
        }
    }

    for(k = 0; k < q.trialCount; k++){
        var inten = Math.max(-1e10, Math.min(1e10, q.intensity[k]));
        var ii = q.i.map( function( x ) { return q.pdf.length + x - Math.round(( inten - q.tGuess ) / q.grain ); } );

        if( ii[ 0 ] < 1){
            ii = ii.map( function( x ) { return (x + 1 - ii[ 0 ]) ; });
        }

        if( ii[ii.length - 1] > q.s2[0].length ){
            ii = ii.map( function( x ) { return( x + q.s2.length - ii[ii.length - 1] ); } );
        }

        let h2 = ii.map( function( x ) { return( q.s2[q.response[k]][x] ); });

        for(i = 0; i < h2.length; i++){
            q.pdf[i] = q.pdf[i] * h2[i];
        }

		if( q.normalizePdf && k % 100 == 0){
            let sumPDF = sumVector(q.pdf);
            q.pdf = q.pdf.map( function( x ) { return x / sumPDF; }); //avoid underflow; keep the pdf normalized // 3 ms
        }
    }


    if( q.normalizePdf ){
        let sumPDF = sumVector( q.pdf );
        q.pdf = q.pdf.map( function( x ) { return x / sumPDF; }); //avoid underflow; keep the pdf normalized // 3 ms
    }

    for(i = 0; i < q.pdf.length; i++){
        if(!isFinite(q.pdf[i])){
            throw new Error( 'pdf is not finite');
        }
    }

    return q;
}

export function QuestUpdate( q, intensity, response ) {
    if( arguments.length != 3){
        throw new Error( "Incorrect number of parameters (3) ");
    }

    if( q === undefined ){
        throw new Error( "q is undefined " );
    }

    // Use helper here?
    if ( !(isFinite( intensity )) || (isNaN( intensity )) ){
        throw new Error( "Intensity must be real, not complex" );
    }

    if (response < 0 || response >= q.s2.length){
        throw new Error( "response " + response + " is out of range 0 to " + q.s2.length);
    }

    if (q.updatePdf == 1) {

        var inten = Math.max( -1e10, Math.min( 1e10 , intensity));
        var ii = q.i.map( function( x ) { return q.pdf.length + x - Math.round(( inten - q.tGuess ) / q.grain ); } );

        if( ii[ 0 ] < 1 || ii[ii.length - 1] > q.s2[0].length ){
            if( q.warnPdf == 1 ){
                let low= ( 1 - q.pdf.length - q.i[0] ) * q.grain + q.tGuess;
                let high=( q.s2[0].length - q.pdf.length - q.i[q.i.length - 1] ) * q.grain + q.tGuess;
                alert('QuestUpdate: intensity ' + inten + ' out of range ' + low + ' to ' + high + '. Pdf will be inexact. Suggest that you increase "range" in call to QuestCreate.');
            }

            if( ii[ 0 ] < 1){
                ii = ii.map( function( x ) { return (x + 1 - ii[ 0 ]) ; });
            }

            else {
                ii = ii.map( function( x ) { return (x + q.s2[0].length - ii[ ii.length - 1]) ; });
            }
        }


        for (let i = 0; i < ii.length; i++) {
            q.pdf[i] = q.pdf[i] * q.s2[response][ii[i] - 1];
        }

        if( q.normalizePdf ){
            let sumPDF = sumVector(q.pdf);
            q.pdf = q.pdf.map( function( x ) { return x / sumPDF; }); //avoid underflow; keep the pdf normalized // 3 ms
        }
    }

    //keep a historical record of the trials
    q.trialCount += 1;

    if(q.trialCount > q.intensity.length){
        // Out of space in preallocated arrays. Reallocate for additional
        // 10000 trials. We reallocate in large chunks to reduce memory
        // fragmentation.

        for (let i = 0; i < 10000; i++) {
            q.intensity.push(0);
            q.response.push(0);
        }
    }

    for (let i = 0; i < q.trialCount; i++) {
        q.intensity[i] = 0.5;
        q.response[i] = response;
    }

    return q;
}

export function QuestTrials(q, binsize){
    if( arguments.length < 1 ){
        throw new Error('Usage: trial=QuestTrials(q,[binsize])');
    }

    if( arguments.length < 2 ){
        binsize = [];
    }

    if( _.isEmpty( binsize ) || !isFinite( binsize )){
        binsize = 0;
    }

    if( binsize < 0 ){
        throw new Error('binsize cannot be negative');
    }

    // sort
    var inIntensity = q.intensity.slice(0, q.trialCount + 1);
    var inResponse = q.response.slice(0, q.trialCount + 1);

    var withIndex = [];
    for (var i in inIntensity) {
        withIndex.push([inIntensity[i], i]);
    }
    withIndex.sort(function(left, right) {
        return left[0] < right[0] ? -1 : 1;
        });

    var indexes = [];
    var intensity = [];

    for (var j in withIndex) {
        intensity.push(withIndex[j][0]);
        indexes.push(withIndex[j][1]);
    }

    var response = [];

    for(i = 0; i < indexes.length; i++){
        response.push(inResponse[indexes[i]]);
    }

    //quantize
    if( binsize > 0){
        intensity = intensity.map(function(x) { return(Math.round( x / binsize ) * binsize); });
    }

    // compact
    j = 0;

    var trial = {
        intensity: [],
        responses: [],
    }

    trial.intensity.push(intensity[0]);

    for(i = 0; i < 2; i++){
        trial.responses[i] = new Array();
        trial.responses[i].push(0);
    }

    for( i = 0; i < intensity.length; i++){
        if(intensity[i] != trial.intensity[j]){
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


export function QuestStimulate(q, tTest, tActual, plotIt){
    if( arguments.length < 3 ){
        throw new Error('Usage: response=QuestSimulate(q,tTest,tActual[,plotIt])');
    }

    var linear = require('everpolate').linear

    var x2min = Math.min(q.x2[0], q.x2[q.x2.length-1]);
    var x2max = Math.max(q.x2[0], q.x2[q.x2.length-1]);
    var t= Math.min(Math.max((tTest - tActual), x2min) , x2max);
    var response = linear(t, q.x2, q.p2);

    return response;
}

//t=QuestMean(q)
//Get the mean threshold estimate.

export function QuestMean( q ){
    if( arguments.length != 1 ){
        throw new Error('Usage: t=QuestMean(q)');
    }

    let sumPDF = sumVector( q.pdf );

    let tempA = sumVector(multiplyVector(q.pdf, q.x));

    var t = q.tGuess + tempA / sumPDF;	// mean of our pdf

    return t;
}

//[t,p]=QuestMode(q)
//"t" is the mode threshold estimate
//"p" is the value of the (unnormalized) pdf at t.
export function QuestMode( q ){
    if( arguments.length != 1 ){
        throw new Error('Usage: t=QuestMode(q)');
    }

    let iMode = indexOfMax(q.pdf);
    var t = q.x[iMode] + q.tGuess;
    return t;
}


//sd=QuestSd(q)
//Get the sd of the threshold distribution.

export function QuestSd( q ){
    if( arguments.length != 1 ){
        throw new Error('Usage: sd=QuestSd(q)');
    }
    let p = sumVector( q.pdf );

    var xSquared = q.x.map(function(x){return Math.pow(x, 2); });
    var Squared2 = sumVector( multiplyVector(q.pdf, q.x)) / p; ;

    var sd = Math.sqrt( (sumVector(multiplyVector(q.pdf, xSquared)) / p) - Math.pow(Squared2, 2)) ;
    return sd;
}
//p=QuestPdf(q,t)
// The (possibly unnormalized) probability density of candidate threshold "t".
// q and t may be vectors of the same size, in which case the returned p is a vector of that size.
export function QuestPdf( q, t ){
    if( arguments.length != 2 ){
        throw new Error('Usage: p=QuestPdf(q,t)');
    }

    var i= Math.round( ( t- q.tGuess ) / q.grain ) + 1 + q.dim / 2;
    i = Math.min( q.pdf.length , Math.max( 1 , i ));
    var p = q.pdf[i - 1];
    return p;
}

// p=QuestP(q,x)
// The probability of a correct (or yes) response at intensity x, assuming
// threshold is at x=0.
export function QuestP( q, x ){

    if( !isReal( x ) ){
        throw new Error('x must be real, not complex.');
    }

    var p;


    if( x < q.x2[0] )
        p = q.p2[0];

    else if( x > q.x2[q.x2.length-1] ){
        p = q.p2[q.p2.length-1];
    }

    else{
        var linear = require('everpolate').linear
        p = linear(0, q.x2, q.p2)[0];
    }

    if( !isFinite(p) ){
        throw new Error('psychometric function ' + p + ' at ' + x);
    }

    return p;


}

// intensity=QuestQuantile(q,[quantileOrder])
//  Gets a quantile of the pdf in the struct q. You may specify the desired
//  quantileOrder, e.g. 0.5 for median, or, making two calls, 0.05 and 0.95
//  for a 90% confidence interval. If the "quantileOrder" argument is not
//  supplied, then it's taken from the "q" struct. QuestCreate uses
//  QuestRecompute to compute the optimal quantileOrder and saves that in the
//  "q" struct; this quantileOrder yields a quantile  that is the most
//  informative intensity for the next trial.

export function QuestQuantile( q, quantileOrder ){

    if( arguments.length > 2 ){
        throw new Error('Usage: intensity=QuestQuantile(q,[quantileOrder])');
    }

    if( arguments.length < 2 ){
        quantileOrder = q.quantileOrder;
    }

    if( quantileOrder > 1 || quantileOrder < 0 ) {
        throw new Error('quantileOrder' + quantileOrder + ' is outside range 0 to 1.');
    }

    var p = cumsum( q.pdf );

    if( !isFinite ( p[p.length - 1] )) {
        throw new Error('pdf is not finite');
    }

    if( p[p.length - 1] == 0) {
        throw new Error('pdf is all zero');
    }

    var t;

    if( quantileOrder < p[0] ){
        t = q.tGuess + q.x[0];
        return t;
    }

    if( quantileOrder > p[ p.length - 1] ){
        t = q.tGuess + q.x[ q.x.length - 1];
        return t;
    }

    var tempP = p.slice();

    tempP.unshift(-1);

    let tempA = diff( tempP );
    var index = findZero( tempA );



    if( index.length < 2){
	    throw new Error('pdf has only ' + index.length + ' nonzero point(s)');
    }

    var linear = require('everpolate').linear

    var temp1 = subarrayIndex(p, index);
    var temp2 = subarrayIndex(q.x, index);

    var t  = q.tGuess + (linear(quantileOrder * p[ p.length - 1 ], temp1, temp2)[0]);
    return t;
}

export function PAL_Gumbel(alpha, beta, gamma, lambda, x, varargin){

    const math = require('mathjs');

    if ( arguments.length < 5 || arguments.length > 6){
        throw new Error("Incorrect number of parameters: alpha, beta, gamma, lambda, x, varargin");
    }

    if(  varargin ){
        if( varargin === 'Inverse' ){
            if ( isArray(x)){
                var y = x.map(function(t){
                    var c = math.eval( "(" + t + "-" + gamma + " ) / (1 - " + gamma + "-" + lambda + ") - 1");
                    c = math.eval("-1 * log( -1 * " + c + ")");
                    c = math.eval( "log10( " + c + ")");
                    c = math.divide(c, 2);
                    return math.add(alpha, c);
                })

            }
            else{
                var c = math.eval( "(" + x + "-" + gamma + " ) / (1 - " + gamma + "-" + lambda + ") - 1");
                c = math.eval("-1 * log( -1 * " + c + ")");
                c = math.eval( "log10( " + c + ")");
                c = math.divide(c, 2);
                var y = math.add(alpha, c);
            }
        }
        if( varargin === 'Derivative' ){
            if( isArray( x )){
                var y = x.map(function(x){
                    return math.eval("( 1 - " + gamma + " - " + lambda + ") * e^(-1 * 10^(" + beta + "*" + "(" + x + "-" + alpha + "))) * log(10) * 10^( " + beta + "*(" + x + "-" + alpha + "))*" + beta);
                })
            }
            else{
                var y = (1 - gamma - lambda) * Math.exp( -1  * Math.pow( 10, (beta *(x - alpha)))) * Math.log(10) * Math.pow(10, (beta *( x - alpha))) * beta;
            }
        }
    }

    else{
        if( isArray( x )){
            var y = x.map(function(t){
                return math.eval(gamma + "+ ( 1 - " + gamma + " - " + lambda + ") * ( 1 - e^(-1 * 10^(" + beta + "*" + "(" + t + "-" + alpha + "))))");
            })
        }
        else{
            var y = math.eval(gamma + "+ ( 1 - " + gamma + " - " + lambda + ") * ( 1 - e^(-1 * 10^(" + beta + "*" + "(" + x + "-" + alpha + "))))");
            //var y = gamma + (1 - gamma - lambda) * (1 - Math.exp( -1  * Math.pow( 10, (beta *(x - alpha)))));
        }
    }

    return y;

}

//HELPER FUNCTIONS

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

export function cumsum( arr ){
  var new_array = [];
  arr.reduce((a,b,i) => new_array[i] = a + b, 0);
  return new_array;
}

function multiplyVector(a,b){
  return a.map((e,i) => e * b[i]);
}

export function sumVector(v){
  return v.reduce(( a, b ) => a + b, 0);
}

export function indexOfMax(arr) {
  if (arr.length === 0) {
      return -1;
  }
  const maxVal = _.max(arr);
  return arr.indexOf(maxVal);
}

function isReal( x ){
  return isFinite(x) && !isNaN(x);
}
