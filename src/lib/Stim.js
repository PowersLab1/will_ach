export const visualStim = createVisualStim();
export const patch = createPatch(visualStim);
export const stimulus_blank = createGabor(patch, 0);

export const auditoryStim = createAuditoryStim();

/*****************************
 *                           *
 *      Visual stimulus      *
 *                           *
 *****************************/

// Creates a stimulus structure
export function createVisualStim() {
  var stim = {
    background: 255/2,
    angle: Math.floor(Math.random() * 135) + 45,   // returns a random integer from 45 to 135
    imsize: 256,
    initcontrast:  0.5,                  // initial contrast
    threshold:     0.2,                  // moch treshold
    phases: [0, 0.25],                   // phases either 0 and 0.25
    phase: 0,
    alpha: 0.5,
    ppd: 80,
    frequency: 0,                  // gabor spatial frequency
  };

  stim.phase = stim.phases[Math.round(Math.random())];
  stim.frequency = 2 / stim.ppd;

  return stim;
};

// Creates the gabor layer to be overlaid the noise
export function createGabor(patch, contrast) {
  var grating = patch.map((x) => visualStim.background + (x * visualStim.background * contrast));
  return grating;
}

function createPatch(stim) {
  var xs = [];
  var ys = [];

  for (var x = 1; x < stim.imsize + 1; x++) {
    for (var y = 1; y < stim.imsize + 1; y++) {
      xs[((x -1) + (y - 1) * stim.imsize) * 4 + 0] = x - ((stim.imsize + 1) / 2);
      xs[((x -1) + (y - 1) * stim.imsize) * 4 + 1] = x - ((stim.imsize + 1) / 2);
      xs[((x -1) + (y - 1) * stim.imsize) * 4 + 2] = x - ((stim.imsize + 1) / 2);
      xs[((x -1) + (y - 1) * stim.imsize) * 4 + 3] = x - ((stim.imsize + 1) / 2);

      ys[((x -1) + (y - 1) * stim.imsize) * 4 + 0] = y - ((stim.imsize + 1) / 2);
      ys[((x -1) + (y - 1) * stim.imsize) * 4 + 1] = y - ((stim.imsize + 1) / 2);
      ys[((x -1) + (y - 1) * stim.imsize) * 4 + 2] = y - ((stim.imsize + 1) / 2);
      ys[((x -1) + (y - 1) * stim.imsize) * 4 + 3] = y - ((stim.imsize + 1) / 2);
    }
  }

  var patch = [];
  for (var i = 0; i < xs.length && i < ys.length; i++) {
    patch[i] = 0.5 * Math.cos(
      2 * Math.PI * (stim.frequency * (Math.sin(
        Math.PI / 180 * stim.angle
      ) * xs[i] + Math.cos(
        Math.PI / 180 * stim.angle
      ) * ys[i]
    ) + stim.phase));
  }

  return patch;
}


/*****************************
 *                           *
 *     Auditory stimulus     *
 *                           *
 *****************************/
 export function createAuditoryStim() {
   var stim = {
     duration: 300, // in ms
     amp: 1, // unused
     frequency: 1000,
   };

   return stim;
 };

 // amp is a value in [0,1]
 export function playAuditoryStimulus(stim, audioContext, duration, decibel) {
   beep(decibel, stim.frequency, duration ? duration : stim.duration, audioContext);
 }

 //amp:0..100, freq in Hz, ms
 //  (10^((desired_db - standard_db)/20))*standard_scale
 export function beep(decibel, freq, ms, audioContext) {
   if (!audioContext) return;
   var osc = audioContext.createOscillator();
   var gain = audioContext.createGain();
   osc.connect(gain);
   osc.frequency.value = freq;
   gain.connect(audioContext.destination);
   gain.gain.value = db2scale(decibel, 0.0006418, 56.3);
   osc.start(audioContext.currentTime);
   osc.stop(audioContext.currentTime+ms/1000);
 }

// Courtsey of https://noisehack.com/generate-noise-web-audio-api/
export function playWhiteNoise(audioContext) {
  //console.log(2 * audioContext.sampleRate
  // Create buffer for 2 seconds
  var bufferSize = 3 * audioContext.sampleRate,
   noiseBuffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate),
   output = noiseBuffer.getChannelData(0);

  for (var channel = 0; channel < noiseBuffer.numberOfChannels; channel++) {
    // This gives us the actual ArrayBuffer that contains the data
    var nowBuffering = noiseBuffer.getChannelData(channel);
    for (var i = 0; i < noiseBuffer.length; i++) {
      // audio needs to be in [-1.0; 1.0]
      nowBuffering[i] = (Math.random() * 2 - 1) * db2scale(80, 0.0150, 78.3);
    }
  }

  var whiteNoise = audioContext.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;
  whiteNoise.connect(audioContext.destination);
  whiteNoise.start(0);
}

// Courtsey of https://noisehack.com/generate-noise-web-audio-api/
export function playPinkNoise(audioContext) {
  var bufferSize = 4096;
  var pinkNoise = (function() {
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    var node = audioContext.createScriptProcessor(bufferSize, 1, 1);
    node.onaudioprocess = function(e) {
      var output = e.outputBuffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        var white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
      }
    }
    return node;
  })();

  pinkNoise.connect(audioContext.destination);
}


// Courtsey of https://noisehack.com/generate-noise-web-audio-api/
export function playBrownianNoise(audioContext) {
  var bufferSize = 4096;
  var brownNoise = (function() {
      var lastOut = 0.0;
      var node = audioContext.createScriptProcessor(bufferSize, 1, 1);
      node.onaudioprocess = function(e) {
          var output = e.outputBuffer.getChannelData(0);
          for (var i = 0; i < bufferSize; i++) {
              var white = Math.random() * 2 - 1;
              output[i] = (lastOut + (0.02 * white)) / 1.02;
              lastOut = output[i];
              output[i] *= 3.5; // (roughly) compensate for gain
          }
      }
      return node;
  })();

  brownNoise.connect(audioContext.destination);
}

function db2scale(desiredDb, standardScale, standardDb) {
  return Math.pow(10, (desiredDb - standardDb) / 20) * standardScale;
}
