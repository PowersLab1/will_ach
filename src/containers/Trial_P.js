import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './Trial_P.css';
import {Redirect} from "react-router-dom";
import {beep} from "../utils";
import {connect} from 'react-redux';
import {add_array, add_response_P, add_response_time_P, add_contrast_P} from '../actions/data';
import {createStim, createGabor} from "../Stim.js";
import VisualStimulus from './VisualStimulus';

var _ = require('lodash');
var SimplexNoise = require('simplex-noise');

const DEBUG = true;
const IMG_SRC = "https://raw.githubusercontent.com/PowersLab1/VCH_APP_SMITH/master/src/media/fix_cross.png";
const Q_KEY_CODE = 81;
const E_KEY_CODE = 69;
const STIMULUS_MS = 300;

class Trial_P extends Component {
  /********************************
   *                              *
   *        INITIALIZATION        *
   *                              *
   ********************************/

  constructor(props) {
    super(props);

    // set initial states
    this.state = {
      index: 0,
      complete: false,
      showContrast: false,
      contrast: 0,
    };

    // class props init
    this.canvasRef = React.createRef();
    this.audioContext = new AudioContext();
    this.animationFrameId = 0; // used to cancel last frame (not sure if needed)
    this.initialDelay = 2000 // in ms
    this.delay = 3000; // in ms
    this.numAttempts = 0;
    this.numAttemptsLimit = 100;

    // user inputs
    this.response = [];
    this.responseTime = [];

    // time keeping
    this.timeWindow = false;
    this.startTime = 0;

    // Precompute gabor layers for performance'
    // Specifically, we don't want our animation to pause while
    // trying to compute the gabor layer, which is an expensive operation.
    // So we instead compute them all in the beginning and then use them later.
    this.precomputedGabors = [];
  }

  precomputeGabors() {
    var stim = createStim();
    for (let i = 0; i < this.props.contrasts.length; i++) {
      this.precomputedGabors.push(createGabor(stim, this.props.contrasts[i]));
    }
  }

  /********************************
   *                              *
   *        STIMULI LOGIC         *
   *                              *
   ********************************/

  play_visual_stimulus(contrast, ms) {
    this.setState({
      showContrast: true,
      contrast: contrast,
    });
    setTimeout(() => {
      this.setState({
        showContrast: false,
      });
    }, ms);
  }

  play_auditory_stimulus(amp, ms) {
    beep(amp /* amp */, 830 /* freq */, ms /* ms */, this.audioContext);
  }

  startTrial() {
    var that = this;
    function playStimulus() {
      // If we've reached the end, then shutdown and return
      if (that.state.index == that.props.contrasts.length) {
        that.shutdown();
        return;
      }

      // Start time window for receiving a response
      that.timeWindow = true;
      that.startTime = new Date().getTime() / 1000;

      // Play stimuli
      const contrast = that.props.contrasts[that.state.index];
      that.play_auditory_stimulus(50, STIMULUS_MS);
      that.play_visual_stimulus(contrast, STIMULUS_MS);

      setTimeout(playStimulus, that.delay + that.jitter());
    }
    setTimeout(playStimulus, that.initialDelay);
  }

  shutdown() {
    window.cancelAnimationFrame(this.animationFrameId); // do we need this?
    for (var g = 0; g < this.props.contrasts.length; g++) {
      this.props.add_response_P(this.response[g]);
      this.props.add_response_time_P(this.responseTime[g]);
      this.props.add_contrast_P(this.props.contrasts[g]);
    }
    this.audioContext.close();
    this.setState({ complete: true });
  }

  jitter() {
    return Math.random() / 2 * 1000; // in ms
  }

  log_debug() {
    const index = this.state.index;
    const contrast = this.props.contrasts[index];
    console.log(contrast);
    if (this.response.length > 0) {
      console.log('index: ' + index);
    }
  }

  /********************************
   *                              *
   *        REACT HANDLERS        *
   *                              *
   ********************************/

  componentDidMount() {
    document.addEventListener("keydown", this.keyFunction, false);
    if (this.state.complete == false) {
      this.precomputeGabors();
      this.startTrial(this.audioContext);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyFunction, false);
  }

  render() {
    if (this.state.complete) {
      alert("Trial completed");

      // count how many were correct
      let correct = 0;
      for (let i = 0; i < this.response.length; i ++) {
        correct += this.response[i] == (this.props.contrasts[i] > 0);
      }

      if (correct > 7) {
        console.log('number correct' + correct);
        return <Redirect to="/Continue" />;
      } else {
        console.log('number correct' + correct);
        return <Redirect to="/OnceMore" />;
      }
    }

    return (
      <div className="Trial">
        <input type="hidden"/>
        <header className="Trial-header">
            <VisualStimulus
              showContrast={this.state.showContrast}
              contrast={this.state.contrast}
              precomputedGabor={this.precomputedGabors[this.state.index]}
            />
        </header>
      </div>
    );
  } // end render

  /********************************
   *                              *
   *        OTHER HANDLERS        *
   *                              *
   ********************************/

  keyFunction = (event) => {
    if (!this.timeWindow) {
      return;
    }

    var seconds = new Date().getTime() / 1000;
    if(_.includes([Q_KEY_CODE, E_KEY_CODE], event.keyCode)) {
      // Record 1 as response if Q, record 0 if E
      this.response.push(event.keyCode === Q_KEY_CODE ? 1 : 0);
      this.responseTime.push(seconds - this.startTime);
      this.timeWindow = false;
      this.setState({ index: this.state.index + 1 });

      // Increment index and check if we hit maximum number of attempts
      if (this.numAttempts++ == this.numAttemptsLimit) {
        this.setState({ complete: true });
      }
    }
  }
} // end class


Trial_P.defaultProps = {
  contrasts: _.shuffle([0, 0, 0, 0, 0, 1, 1, 1, 1, 1]),
}

Trial_P.propTypes = {
  contrasts: PropTypes.array.isRequired,
}

/* redux store */

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
