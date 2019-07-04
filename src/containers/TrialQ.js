import React, { Component } from 'react';
import './TrialQ.css';
import { Redirect } from "react-router-dom";
import { createStim, createGabor } from "../Stim.js"
import { QuestCreate, QuestRecompute, QuestTrials, QuestUpdate, QuestStimulate, QuestMean, QuestMode, QuestSd, QuestP, QuestPdf, QuestQuantile, PAL_Gumbel } from "../Quest.js"
import { ch_QuestBetaAnalysis, process_data, gumbel_intensities } from "../VisualQuest.js"

import { connect } from 'react-redux'
import { add_array, add_response_q_1, add_response_time_q_1, add_contrast_q_1, add_response_q_2, add_response_time_q_2, add_contrast_q_2, add_object } from '../actions/data'

class TrialQ extends Component {

  constructor(props) {
    super(props);
    this.keyFunction = this.keyFunction.bind(this);
    this.create_noise = this.create_noise.bind(this);
    // this.process_data = this.process_data.bind(this);
    // this.gumbel_intensities = this.gumbel_intensities.bind(this);
    this.state = {
      continue: false,
      counter: 0,
      counter2: 0,
      change: false,

      responses_q_1: [],
      contrast_array_q_1: [],
      response_time_q_1: [],

      responses_q_2: [],
      contrast_array_q_2: [],
      response_time_q_2: [],

      time_window: false,
      time_window_start: 0,
      limit: 100,

      currentQ: 1, //1 for contrast 1 and 2 for contrast 2

    }
    this.canvasRef = React.createRef();
    this.audioContext = new AudioContext();
  }

  create_noise(audioContext) {

    var end = 80;
    // var contrast_block = tt1;
    var index1 = 0;
    var index2 = 0;
    var total = 0;

    var SimplexNoise = require('simplex-noise');

    var simplex = new SimplexNoise(),
      canvas = document.getElementById('c'),
      ctx = canvas.getContext('2d'),
      imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height),
      data = imgdata.data,
      t = 0;

    //initializing QUEST
    var tGuess = 0.5,
      tGuessSd = 0.1,
      pThreshold = 0.75,
      beta = 3.5,
      delta = 0.01,
      gamma = 0.01,
      grain = 0.001,
      dim = 1000,
      range = 20;
    var q_1 = QuestCreate(tGuess, tGuessSd, pThreshold, beta, delta, gamma, grain, range);
    var q_2 = QuestCreate(tGuess, tGuessSd, pThreshold, beta, delta, gamma, grain, range);

    var stim = createStim();
    var stimulus_blank = createGabor(stim, 0);

    var stimulus;
    var jitter = Math.floor(Math.random() * 50); //jitter tone presentation 0-500ms per trial
    var start_time = 100;
    var contrast = 0;
    var intervalId = undefined;

    var that = this;
    var seconds = 0;

    var img = new Image();

    async function vis_quest() {

      if (t == start_time + jitter) {

        index1 = that.state.counter;
        index2 = that.state.counter2;

        total = index1 + index2;

        console.log(QuestQuantile(q_1), QuestQuantile(q_2));

        // determining which staircase to use
        if (index1 == index2) {
          that.setState({             //current staircase is 1
            currentQ: 1,
          });
        }

        if (index1 != index2) {
          that.setState({             //current staircase is 2
            currentQ: 2,
          });
        }

        if (that.state.currentQ == 1) {
          if (index1 = 0) {
            contrast = tGuess + .3;
          }
          else {
            contrast = QuestQuantile(q_1);
          }
        }
        if (that.state.currentQ == 2) {
          if (index2 = 0) {
            contrast = tGuess - 0.3;
          }
          else {
            contrast = QuestQuantile(q_2);
          }
        }

        console.log(contrast);

        var seconds = new Date().getTime() / 1000;

        // console.log("time on ", seconds);

        that.setState({
          rating_window: true,
          time_window: true,
          time_window_start: seconds,
        });

        console.log("for 1", that.state.responses_q_1, that.state.contrast_array_q_1);
        console.log("for 2", that.state.responses_q_2, that.state.contrast_array_q_2);

        stimulus = createGabor(stim, contrast);
        beep(50, 830, 300, audioContext); //beep for arg3 miliseconds
      }

      for (var x = 0; x < 256; x++) {
        for (var y = 0; y < 256; y++) {
          if (t == start_time + jitter || t == start_time + jitter + 1 || t == start_time + jitter + 2 || t == start_time + jitter + 3 || t == start_time + jitter + 4
            || t == start_time + jitter + 5 || t == start_time + jitter + 6 || t == start_time + jitter + 7 || t == start_time + jitter + 8 || t == start_time + jitter + 9
            || t == start_time + jitter + 10 || t == start_time + jitter + 11 || t == start_time + jitter + 12 || t == start_time + jitter + 13 || t == start_time + jitter + 14
            || t == start_time + jitter + 15 || t == start_time + jitter + 16 || t == start_time + jitter + 17 || t == start_time + jitter + 18 || t == start_time + jitter + 19
            || t == start_time + jitter + 20 || t == start_time + jitter + 21 || t == start_time + jitter + 22 || t == start_time + jitter + 23 || t == start_time + jitter + 24
            || t == start_time + jitter + 25 || t == start_time + jitter + 26 || t == start_time + jitter + 27 || t == start_time + jitter + 28 || t == start_time + jitter + 29
            || t == start_time + jitter + 30) {
            if (t == start_time + jitter + 30) {
              t = 0;
              //during beep show signal, then reset timer to 0
            }

            var r = simplex.noise3D(x / 8, y / 8, t / 8) * 0.4 + 0.35;
            data[(x + y * 256) * 4 + 0] = stim.alpha * stimulus[(x + y * 256) * 4 + 0] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 1] = stim.alpha * stimulus[(x + y * 256) * 4 + 1] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 2] = stim.alpha * stimulus[(x + y * 256) * 4 + 2] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 3] = 255;
          }

          else {

            seconds = new Date().getTime() / 1000

            if (that.state.time_window_start + 2 == seconds) {
              that.setState({
                time_window: false,
              });

              if (that.state.currentQ == 1) {

                if (that.state.contrast_array_q_1.length < that.state.responses_q_1.length) {
                  that.setState({ contrast_array_q_1: that.state.contrast_array_q_1.concat([contrast]) });
                  that.setState({ change: true });
                }
              }

              if (that.state.currentQ == 2) {

                if (that.state.contrast_array_q_2.length < that.state.responses_q_2.length) {
                  that.setState({ contrast_array_q_2: that.state.contrast_array_q_2.concat([contrast]) });
                  that.setState({ change: true });
                }
              }

              var r = simplex.noise3D(x / 8, y / 8, t / 8) * 0.4 + 0.35;
              data[(x + y * 256) * 4 + 0] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 0] + (1 - stim.alpha) * r * 250;
              data[(x + y * 256) * 4 + 1] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 1] + (1 - stim.alpha) * r * 250;
              data[(x + y * 256) * 4 + 2] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 2] + (1 - stim.alpha) * r * 250;
              data[(x + y * 256) * 4 + 3] = 255;
              //if there is no beep, show blank signal
              // console.log("time off ", seconds);
            }

            else {
              var r = simplex.noise3D(x / 8, y / 8, t / 8) * 0.4 + 0.35;
              data[(x + y * 256) * 4 + 0] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 0] + (1 - stim.alpha) * r * 250;
              data[(x + y * 256) * 4 + 1] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 1] + (1 - stim.alpha) * r * 250;
              data[(x + y * 256) * 4 + 2] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 2] + (1 - stim.alpha) * r * 250;
              data[(x + y * 256) * 4 + 3] = 255;
              //if there is no beep, show blank signal
            }



          }
        }
      }

      t++;
      ctx.putImageData(imgdata, 0, 0);

      img.src = "https://raw.githubusercontent.com/PowersLab1/VCH_APP_SMITH/master/src/media/fix_cross.png";
      var recWidth = canvas.width / 8;
      var recHeight = canvas.height / 8;

      var xPos = (canvas.width / 2) - (recWidth / 2);
      var yPos = (canvas.height / 2) - (recHeight / 2);

      ctx.fillStyle = "gray";
      ctx.fillRect(xPos, yPos, recWidth, recHeight);
      ctx.drawImage(img, xPos, yPos, recWidth, recHeight);

      if (total == end) {
        var returnStruct = process_data(q_1, q_2);
        that.props.add_object(returnStruct);
        window.cancelAnimationFrame(intervalId);
        that.audioContext.close();
        for (var g = 0; g < end; g++) {
          that.props.add_response_q_1(that.state.responses_q_1[g]);
          that.props.add_response_time_q_1(that.state.response_time_q_1[g]);
          that.props.add_contrast_q_1(that.state.contrast_array_q_1[g]);
          that.props.add_response_q_2(that.state.responses_q_2[g]);
          that.props.add_response_time_q_2(that.state.response_time_q_2[g]);
          that.props.add_contrast_q_2(that.state.contrast_array_q_2[g]);
        }
        that.setState({ continue: true });
        return;
      }

      if (total < end) {
        intervalId = window.requestAnimationFrame(vis_quest);

        if (that.state.currentQ == 1 && that.state.change == true) {
          // console.log("changing the q")
          q_1 = QuestUpdate(q_1, [that.state.contrast_array_q_1[that.state.contrast_array_q_1.length - 1]], [that.state.responses_q_1[that.state.responses_q_1.length - 1]]);
          console.log(QuestQuantile(q_1));
          that.setState({ change: false });
        }

        if (that.state.currentQ == 2 && that.state.change == true) {
          q_2 = QuestUpdate(q_2, that.state.contrast_array_q_1[that.state.contrast_array_q_1.length - 1], that.state.responses_q_1[that.state.responses_q_1.length - 1]);
          that.setState({ change: false });
        }
      }

    }

    vis_quest.call(that);

  }

  keyFunction(event) {
    var seconds = new Date().getTime() / 1000

    if (event.keyCode === 81 && this.state.time_window == true && this.state.currentQ == 1) {

      // Set setState
      this.setState({
        counter: this.state.counter + 1,
        responses_q_1: this.state.responses_q_1.concat([1]),
        response_time_q_1: this.state.response_time_q_1.concat([seconds - this.state.time_window_start]),
        time_window: false,
      });

      if (this.state.counter == this.state.limit) {
        this.setState({ continue: true });
      }

    }

    if (event.keyCode === 81 && this.state.time_window == true && this.state.currentQ == 2) {

      // Set setState
      this.setState({
        counter2: this.state.counter2 + 1,
        responses_q_2: this.state.responses_q_2.concat([1]),
        response_time_q_2: this.state.response_time_q_2.concat([seconds - this.state.time_window_start]),
        time_window: false,
      });

      if (this.state.counter == this.state.limit) {
        this.setState({ continue: true });
      }

    }

    if (event.keyCode === 69 && this.state.time_window == true && this.state.currentQ == 1) {
      this.setState({
        counter: this.state.counter + 1,
        responses_q_1: this.state.responses_q_1.concat([0]),
        response_time_q_1: this.state.response_time_q_1.concat([seconds - this.state.time_window_start]),
        time_window: false,
        rating_window: false,
      });

      if (this.state.counter == this.state.limit) {
        this.setState({ continue: true });
      }
    }

    if (event.keyCode === 69 && this.state.time_window == true && this.state.currentQ == 2) {
      this.setState({
        counter: this.state.counter2 + 1,
        responses_q_2: this.state.responses_q_2.concat([0]),
        response_time_q_2: this.state.response_time_q_2.concat([seconds - this.state.time_window_start]),
        time_window: false,
        rating_window: false,
      });

      if (this.state.counter == this.state.limit) {
        this.setState({ continue: true });
      }
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.keyFunction, false);
    if (this.state.continue == false) {
      this.create_noise(this.audioContext);
    }
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyFunction, false);
  }

  render() {

    if (this.state.continue == true) {
      // alert("Trial completed")
      return <Redirect to="/Complete" />
    }

    return (
      <div className="TrialQ">
        <input type="hidden" />
        <header className="TrialQ-header">
          <canvas id="c" width="256" height="256"
            style={{ zIndex: "0", position: "fixed", left: "25%", width: '50%', height: 'auto' }}></canvas>
          <p style={{ fontSize: "10", fontWeight: "bold" }}> PLEASE RATE CONFIDENCE 1-5 </p>
          <canvas id="c2" width="256" height="256"
            style={{ zIndex: "1", position: "fixed", left: "25%", width: '50%', height: 'auto' }}></canvas>
        </header>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  data: state.data,
})

const mapDispatchToProps = dispatch => ({
  add_response_q_1: (element) => dispatch(add_response_q_1(element)),
  add_response_time_q_1: (element) => dispatch(add_response_time_q_1(element)),
  add_contrast_q_1: (element) => dispatch(add_contrast_q_1(element)),
  add_response_q_2: (element) => dispatch(add_response_q_2(element)),
  add_response_time_q_2: (element) => dispatch(add_response_time_q_2(element)),
  add_contrast_q_2: (element) => dispatch(add_contrast_q_2(element)),
  add_array: (arr) => dispatch(add_array(arr)),
  add_object: (obj) => dispatch(add_object(obj)),
})


export default connect(mapStateToProps, mapDispatchToProps)(TrialQ);


function beep(amp, freq, ms, audioContext) {//amp:0..100, freq in Hz, ms
  if (!audioContext) return;
  var osc = audioContext.createOscillator();
  var gain = audioContext.createGain();
  osc.connect(gain);
  osc.value = freq;
  gain.connect(audioContext.destination);
  gain.gain.value = amp / 100;
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + ms / 1000);
}

//array shuffling function, used to randomize order of presentation for different blocks
function shuffle(array) {
  var i = 0
  var j = 0
  var temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}
