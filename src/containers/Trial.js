import React, { Component } from 'react';
import './Trial.css';
import { Redirect } from "react-router-dom";
import { createStim, createGabor } from "../Stim.js"

import { connect } from 'react-redux'
import { add_array, add_response_1, add_response_time_1, add_contrast_1 } from '../actions/data'

class Trial extends Component {

  constructor(props) {
    super(props);
    this.keyFunction = this.keyFunction.bind(this);
    this.create_noise = this.create_noise.bind(this);
    this.state = {
      continue: false,
      counter: 0,
      //sets up the arrays to be filled with test data
      responses_1: [],
      contrast_array_1: [],
      response_time_1: [],
      ratings_1: [],

      responses_2: [],
      contrast_array_2: [],
      response_time_2: [],
      ratings_2: [],

      time_window: false,
      time_window_start: 0,
      time_window_rating: false,
      limit: 100,


      contrast_flag: 1, //1 for contrast 1 and 2 for contrast 2

    }
    this.canvasRef = React.createRef();
    this.audioContext = new AudioContext();
  }

  create_noise(audioContext, callback) {

    // contrast values
    var c25 = 0.2;
    var c50 = 0.5;
    var c75 = 0.75;

    //train_test arrays
    var tt1 = [c25, c50, c75];
    var end = tt1.length;
    var contrast_block = tt1;
    var index = 0;

    var SimplexNoise = require('simplex-noise');
    //creates a new simplex structure to be used in generating noise
    var simplex = new SimplexNoise(),
      canvas = document.getElementById('c'),
      ctx = canvas.getContext('2d'),
      imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height),
      data = imgdata.data,
      t = 0;

    //create the stimulus and the filter 
    var stim = createStim();
    var stimulus_blank = createGabor(stim, 0);

    var stimulus;
    var jitter = Math.floor(Math.random() * 20); //jitter tone presentation 0-500ms per trial
    var start_time = 100;
    var contrast = 0;
    var intervalId = undefined;

    var that = this;

    async function generate_noise() {

      if (t == start_time + jitter) {
        index = that.state.counter;

        //derive contrast values from an array
        contrast = contrast_block[index++];
        console.log(contrast);

        var seconds = new Date().getTime() / 1000;

        console.log("time on ", seconds);

        //set the time window for inputs 
        that.setState({
          time_window: true,
          time_window_rating: true,
          time_window_start: seconds,
        });

        //console.log(that.state.responses_1, that.state.ratings_1, that.state.response_time_1, that.state.contrast_array_1);

        //create new layer with the contrast value
        stimulus = createGabor(stim, contrast);
        //beep for arg3 miliseconds
        beep(50, 830, 300, audioContext);
      }

      //create the noise by filling arrays with pixel values
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
            }

            //apply the stimulus layer over the noise 
            var r = simplex.noise3D(x / 8, y / 8, t / 8) * 0.4 + 0.35;
            data[(x + y * 256) * 4 + 0] = stim.alpha * stimulus[(x + y * 256) * 4 + 0] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 1] = stim.alpha * stimulus[(x + y * 256) * 4 + 1] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 2] = stim.alpha * stimulus[(x + y * 256) * 4 + 2] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 3] = 255;
          }

          else {

            seconds = new Date().getTime() / 1000
            //sets the time window for user input
            if (that.state.time_window_start + 2 == seconds) {
              that.setState({
                time_window: false,
                time_window_rating: false,
              });
              //checks to see if a response was given
              if (that.state.contrast_array_1.length < that.state.responses_1.length) {
                that.setState({ contrast_array_1: that.state.contrast_array_1.concat([contrast]) });
              }

              //checks to see if a rating was given with a response, otherwise discards the values
              if (that.state.responses_1.length != that.state.ratings_1.length) {

                if (that.state.responses_1.length > that.state.ratings_1.length) {

                  console.log("response and response time discarded", that.state.responses_1, that.state.response_time_1, that.state.ratings_1, that.state.contrast_array_1);
                  //discards the values and resets counter to old state
                  that.setState({
                    responses_1: that.state.responses_1.slice(0, that.state.ratings_1.length),
                    response_time_1: that.state.response_time_1.slice(0, that.state.ratings_1.length),
                    counter: that.state.counter - 1,
                    contrast_array_1: that.state.contrast_array_1.slice(0, that.state.ratings_1.length)
                  });
                }

                else {
                  console.log("rating discarded", that.state.responses_1, that.state.ratings_1, that.state.contrast_array_1);

                  that.setState({
                    ratings_1: that.state.ratings_1.slice(0, that.state.responses_1.length),
                  });
                }
              }
              console.log("time off ", seconds);
            }

            //noise with blank signal
            var r = simplex.noise3D(x / 8, y / 8, t / 8) * 0.4 + 0.35;
            data[(x + y * 256) * 4 + 0] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 0] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 1] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 1] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 2] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 2] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 3] = 255;
          }
        }
      }

      //insert the image data
      t++;
      ctx.putImageData(imgdata, 0, 0);

      //insert the reticle for focusing
      var recWidth = canvas.width / 8;
      var recHeight = canvas.height / 8;
      var xPos = (canvas.width / 2) - (recWidth / 2);
      var yPos = (canvas.height / 2) - (recHeight / 2);
      var img = new Image();
      img.src = "https://www.shareicon.net/data/256x256/2015/12/04/682310_cross_512x512.png";
      ctx.fillStyle = "gray";

      ctx.fillRect(xPos, yPos, recWidth, recHeight);
      ctx.drawImage(img, xPos, yPos, recWidth, recHeight);

      //add the data to redux and cancel the animation/audioContext when finished
      if (index == end) {
        window.cancelAnimationFrame(intervalId);
        for (var g = 0; g < end; g++) {
          that.props.add_response_1(that.state.responses_1[g]);
          that.props.add_response_time_1(that.state.response_time_1[g]);
          that.props.add_contrast_1(that.state.contrast_array_1[g]);
        }

        that.audioContext.close();
        that.setState({ continue: true });
        return;
      }

      if (index < end) {
        intervalId = window.requestAnimationFrame(generate_noise);
      }

    }

    generate_noise.call(that);

  }

  //monitor key presses for input
  keyFunction(event) {
    var seconds = new Date().getTime() / 1000

    if (event.keyCode === 81 && this.state.time_window == true) {

      // Set setState accordingly to Q input (true)
      this.setState({
        counter: this.state.counter + 1,
        responses_1: this.state.responses_1.concat([1]),
        response_time_1: this.state.response_time_1.concat([seconds - this.state.time_window_start]),
        time_window: false,
      });

      if (this.state.counter == this.state.limit) {
        this.setState({ continue: true });
      }

    }

    // Set setState accordingly to E input (false)
    if (event.keyCode === 69 && this.state.time_window == true) {
      this.setState({
        counter: this.state.counter + 1,
        responses_1: this.state.responses_1.concat([0]),
        response_time_1: this.state.response_time_1.concat([seconds - this.state.time_window_start]),
        time_window: false,
      });

      if (this.state.counter == this.state.limit) {
        this.setState({ continue: true });
      }
    }

    //set ratings according to key press (1-5)
    if ((event.keyCode === 49 || event.keyCode === 50 || event.keyCode === 51 || event.keyCode === 52 || event.keyCode === 53) && this.state.time_window_rating == true) {
      this.setState({
        ratings_1: this.state.ratings_1.concat([event.keyCode - 48]),
        time_window_rating: false,
      });
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
      alert("Trial completed")
      return <Redirect to="/Complete" />
    }

    return (
      <div className="Trial">
        <input type="hidden" />
        <header className="Trial-header">
          <canvas id="c" width="256" height="256"
            style={{ zIndex: "0", position: "fixed", left: "25%", width: '50%', height: 'auto' }}></canvas>
          <canvas id="c2" width="256" height="256"
            style={{ zIndex: "1", position: "fixed", left: "25%", width: '50%', height: 'auto' }}></canvas>
        </header>
      </div>
    );
  }
}

//maps the data from redux to the component for access
const mapStateToProps = state => ({
  data: state.data,
})

//maps functions to the component for redux 
const mapDispatchToProps = dispatch => ({
  add_response_1: (element) => dispatch(add_response_1(element)),
  add_response_time_1: (element) => dispatch(add_response_time_1(element)),
  add_contrast_1: (element) => dispatch(add_contrast_1(element)),
  add_array: (arr) => dispatch(add_array(arr)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Trial);

// emits the beep using audioContext API for the Visual Trial
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



