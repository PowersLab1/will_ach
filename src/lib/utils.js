//amp:0..100, freq in Hz, ms
export function beep(amp, freq, ms, audioContext) {
  if (!audioContext) return;
  var osc = audioContext.createOscillator();
  var gain = audioContext.createGain();
  osc.connect(gain);
  osc.value = freq;
  gain.connect(audioContext.destination);
  gain.gain.value = amp/100;
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime+ms/1000);
}
