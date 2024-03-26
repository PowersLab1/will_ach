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
     amp: 1, //originally set to 15 but this is too loud
     frequency: 500,
   };

   return stim;
 };

 export function playAuditoryStimulus(stim, audioContext) {
   beep(stim.amp, stim.frequency, stim.duration, audioContext);
 }

 //amp:0..100, freq in Hz, ms
 export function beep(amp, freq, ms, audioContext) {
   if (!audioContext) return;
   var osc = audioContext.createOscillator();
   var gain = audioContext.createGain();
   osc.connect(gain);
   osc.frequency.value = freq;
   gain.connect(audioContext.destination);
   gain.gain.value = amp/100;
   osc.start(audioContext.currentTime);
   osc.stop(audioContext.currentTime+ms/1000);
 }
