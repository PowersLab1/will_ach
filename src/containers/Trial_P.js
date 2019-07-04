import React, { Component } from 'react';
import './Trial_P.css';
import { Redirect } from "react-router-dom";
import { createStim, createGabor } from "../Stim.js"

import { connect } from 'react-redux'
import { add_array, add_response_P, add_response_time_P, add_contrast_P } from '../actions/data'

class Trial_P extends Component {

    constructor(props) {
        super(props);
        this.keyFunction = this.keyFunction.bind(this);
        this.create_noise = this.create_noise.bind(this);
        this.state = {
          continue: false,
          correct: 0,
          counter: 0,

          responses_P: [],
          contrast_array_P: [],
          response_time_P: [],

          // responses_2: [],
          // contrast_array_2: [],
          // response_time_2: [],

          time_window: false,
          time_window_start: 0,
          limit: 100,


          contrast_flag: 1, //1 for contrast 1 and 2 for contrast 2

        }
        this.canvasRef = React.createRef();
        this.audioContext = new AudioContext();
      }

      create_noise( audioContext, callback ){

        // contrast values
        var c_practice = 1;

        //train_test arrays
        var practice = [0,0,0,0,0,c_practice,c_practice,c_practice,c_practice,c_practice];
        var contrast_block  = shuffle(practice);
        var check = binary(contrast_block);
        console.log(check);
        var end = (practice.length+1);
        var index = 0;

        var SimplexNoise = require('simplex-noise');

        var simplex = new SimplexNoise(),
          canvas = document.getElementById('c'),
          ctx = canvas.getContext('2d'),
          imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height),
          data = imgdata.data,
          t = 0;

        var stim = createStim();
        var stimulus_blank = createGabor( stim, 0 );

        var stimulus;
        var jitter = Math.floor(Math.random()* 20); //jitter tone presentation 0-500ms per trial
        var start_time = 100;
        var contrast = 0;
        var intervalId = undefined;

        var that = this;
        var seconds = 0;

        async function generate_noise( ){

            if ( t == start_time + jitter){
              index = that.state.counter;

              contrast = contrast_block[index];
              console.log(contrast);
            if (that.state.responses_P.length > 0){
              console.log('index: ' + index);
              if (that.state.responses_P[(index-1)] == check[(index-1)]){
                console.log("correct");
                that.state.correct++;
                console.log('how many correct' + that.state.correct);
              }
              else {
                console.log("wrong");
              }
            }
            index++;

              var seconds = new Date().getTime() / 1000;

              // console.log("time on ", seconds);

              that.setState({
                time_window: true,
                time_window_start: seconds,
              });

              console.log(that.state.responses_P, that.state.contrast_array_P);

              stimulus = createGabor( stim, contrast );
              beep(50, 830, 300, audioContext); //beep for arg3 miliseconds
            }

            for (var x = 0; x < 256; x++) {
              for (var y = 0; y < 256; y++) {
                if(t == start_time + jitter || t == start_time + jitter + 1 || t == start_time + jitter + 2|| t == start_time+ jitter+3 || t == start_time + jitter+4
                  || t == start_time+ jitter + 5 || t == start_time+ jitter +6 || t == start_time+ jitter +7|| t == start_time + jitter+8|| t == start_time+ jitter+9
                  || t == start_time + jitter+ 10|| t == start_time+ jitter +11|| t == start_time+ jitter +12|| t == start_time + jitter+13|| t == start_time+ jitter+14
                  || t == start_time + jitter+ 15|| t == start_time + jitter + 16|| t == start_time+ jitter +17|| t == start_time + jitter +18|| t == start_time+ jitter +19
                  || t == start_time+ jitter + 20|| t == start_time+ jitter + 21|| t == start_time+ jitter + 22|| t == start_time+ jitter + 23|| t == start_time+ jitter + 24
                  || t == start_time+ jitter + 25|| t == start_time+ jitter + 26|| t == start_time+ jitter + 27|| t == start_time+ jitter + 28|| t == start_time+ jitter + 29
                  || t == start_time+ jitter + 30){
                  if( t == start_time+ jitter +30 ){
                    t = 0;
                    //during beep show signal, then reset timer to 0
                  }

                  var r = simplex.noise3D(x / 8, y / 8, t/8)* 0.4 + 0.35;
                  data[(x + y * 256) * 4 + 0] = stim.alpha * stimulus[(x + y * 256) * 4 + 0] + (1 - stim.alpha) * r * 250;
                  data[(x + y * 256) * 4 + 1] = stim.alpha * stimulus[(x + y * 256) * 4 + 1] + (1 - stim.alpha) * r * 250;
                  data[(x + y * 256) * 4 + 2] = stim.alpha * stimulus[(x + y * 256) * 4 + 2] + (1 - stim.alpha) * r * 250;
                  data[(x + y * 256) * 4 + 3] = 255;
                }

                else{

                  seconds = new Date().getTime() / 1000

                  if(that.state.time_window_start + 2 == seconds){
                    that.setState({
                      time_window: false,
                    });

                    if(that.state.contrast_array_P.length < that.state.responses_P.length){
                      that.setState({ contrast_array_P: that.state.contrast_array_P.concat([contrast]) });
                    }
                    // console.log("time off ", seconds);
                  }


                  var r = simplex.noise3D(x / 8, y / 8, t/8) * 0.4 + 0.35;
                  data[(x + y * 256) * 4 + 0] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 0] + (1 - stim.alpha) * r * 250;
                  data[(x + y * 256) * 4 + 1] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 1] + (1 - stim.alpha) * r * 250;
                  data[(x + y * 256) * 4 + 2] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 2] + (1 - stim.alpha) * r * 250;
                  data[(x + y * 256) * 4 + 3] = 255;
                  //if there is no beep, show blank signal
                }
              }
            }

            t++;
            ctx.putImageData(imgdata, 0, 0);

            var recWidth = canvas.width / 8;
            var recHeight = canvas.height / 8;

            var xPos = (canvas.width/2) - (recWidth/2);

            var yPos = (canvas.height/2) - (recHeight/2);
            var img=new Image();
            img.src = "https://raw.githubusercontent.com/PowersLab1/VCH_APP_SMITH/master/src/media/fix_cross.png";
            ctx.fillStyle = "gray";

            ctx.fillRect(xPos, yPos, recWidth, recHeight);
            ctx.drawImage(img, xPos, yPos, recWidth, recHeight);

            if(index == end ){
              window.cancelAnimationFrame(intervalId);
              for(var g = 0; g < end; g++){
                that.props.add_response_P( that.state.responses_P[g] );
                that.props.add_response_time_P( that.state.response_time_P[g] );
                that.props.add_contrast_P( that.state.contrast_array_P[g] );
              }

              that.audioContext.close();
              that.setState({ continue: true });
              return;
            }

            if(index < end){
              intervalId = window.requestAnimationFrame(generate_noise);
            }

          }

          generate_noise.call(that);

      }

      keyFunction(event){
        var seconds = new Date().getTime() / 1000

        if(event.keyCode === 81 && this.state.time_window == true){

          // Set setState
          this.setState({
            counter: this.state.counter + 1,
            responses_P: this.state.responses_P.concat([1]),
            response_time_P: this.state.response_time_P.concat([ seconds - this.state.time_window_start]),
            time_window: false,
          });

          if(this.state.counter == this.state.limit){
            this.setState({ continue: true });
          }

        }

        if(event.keyCode === 69 && this.state.time_window == true) {
          this.setState({
            counter: this.state.counter + 1,
            responses_P: this.state.responses_P.concat([0]),
            response_time_P: this.state.response_time_P.concat([ seconds - this.state.time_window_start]),
            time_window: false,
          });

          if(this.state.counter == this.state.limit){
            this.setState({ continue: true });
          }
        }
      }

      componentDidMount(){
        document.addEventListener("keydown", this.keyFunction, false);
        if(this.state.continue == false){
          this.create_noise( this.audioContext );
        }
      }
      componentWillUnmount(){
        document.removeEventListener("keydown", this.keyFunction, false);
      }

      render() {

        if(this.state.continue == true){
          alert("Trial completed")
          if (this.state.correct > 7) {
            console.log('number correct' + this.state.correct);
            return <Redirect to="/Continue" />
          }
          else {
          console.log('number correct' + this.state.correct);
          return <Redirect to="/OnceMore" />
          }
        }

        return (
          <div className="Trial">
            <input type="hidden"/>
            <header className="Trial-header">
            <canvas id="c" width="256" height="256"
              style={{ zIndex:"0", position: "fixed", left: "25%",width: '50%', height:'auto'}}></canvas>
            <canvas id="c2" width="256" height="256"
              style={{ zIndex:"1", position: "fixed", left: "25%", width: '50%', height:'auto'}}></canvas>
            </header>
          </div>
        );
      }
    }

const mapStateToProps = state => ({
  data: state.data,
})

const mapDispatchToProps = dispatch => ({
  add_response_P: ( element ) => dispatch(add_response_P( element )),
  add_response_time_P: ( element ) => dispatch(add_response_time_P( element )),
  add_contrast_P: ( element ) => dispatch(add_contrast_P( element )),
  add_array: ( arr ) => dispatch(add_array( arr )),
})

export default connect(mapStateToProps, mapDispatchToProps)(Trial_P);


function beep(amp, freq, ms, audioContext){//amp:0..100, freq in Hz, ms
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

 //array shuffling function, used to randomize order of presentation for different blocks
function shuffle (array) {
  var i = 0
  var j = 0
  var temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
    }
    return array;
  }

  function binary (array){
    for (let i = 0; i < array.length; i++){
      if (array[i] !== 0 ){
        array[i] = 1;
      }
    }
    return array;
  }
