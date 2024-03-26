import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './Trial.css';
import {
  patch,
  createGabor,
  auditoryStim,
  playAuditoryStimulus
} from "../lib/Stim.js";
import VisualStimulus from './VisualStimulus';
import {Redirect} from "react-router-dom";

import {getStore, getEncryptedMetadata, getDataSent} from '../store';

var _ = require('lodash');
const config = require('../config');
var AudioContext = window.AudioContext || window.webkitAudioContext;

const Q_KEY_CODE = 81;
const E_KEY_CODE = 69;
const KEY_CODE_TO_RATING = {
  49: 1,
  50: 2,
  51: 3,
  52: 4,
  53: 5,
};
// We want key codes in number form, hence the parseInt
const RATING_KEY_CODES = _.map(
  _.keys(KEY_CODE_TO_RATING),
  (k) => parseInt(k, 10)
);
const STIMULUS_MS = 300;

class Trial extends Component {
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
      showContrast: false,
      contrast: 0,
      responseWindow: false,
      ratingWindow: false,
      trialStarted: false,
      complete: false,
      invalid: false,
      readyToStart: false,
      dataSent: getDataSent(),

      // ratings related state
      currentRating: 1,
      stopIncrementingRating: false,
      stopShowingRating: false,
    };

    // class props init
    this.canvasRef = React.createRef();
    this.audioContext = new AudioContext();
    this.initialDelay = 2000; // time until first stimulus, in ms
    this.delay = 2500; // time in between stimuli, in ms
    this.numAttempts = 0;
    this.numAttemptsLimit = 1000;

    // user inputs
    this.response = [];
    this.responseTime = [];
    this.ratings = [];
    this.ratingsRaw = [];
    this.timestamps = [];

    // timers
    this.ratingTimer = undefined;
    this.stimulusTimer = undefined;

    // time keeping
    this.componentStartTime = 0;
    this.startTime = 0;
    this.ratingStartTime = 0;

    // keydown status
    this.isKeyDown = {
      Q_KEY_CODE: false,
      E_KEY_CODE: false,
    }

    // Precompute gabor layers for performance
    // Specifically, we don't want our animation to pause while
    // trying to compute the gabor layer, which is an expensive operation.
    // So we instead compute them all in the beginning and then use them later.
    this.precomputedGabors = [];
  }

  precomputeGabors() {
    for (let i = 0; i < this.props.contrasts.length; i++) {
      if (_.isUndefined(this.precomputedGabors[i])) {
        this.precomputedGabors[i] = createGabor(patch, this.props.contrasts[i]);
      }
    }
  }

  addTimestamp(eventName) {
    if (eventName == "start") {
      this.componentStartTime = new Date().getTime();
      this.timestamps.push([eventName, 0]);
    } else {
      this.timestamps.push([eventName, new Date().getTime() - this.componentStartTime]);
    }
  }

  /********************************
   *                              *
   *        STIMULI LOGIC         *
   *                              *
   ********************************/

  playVisualStimulus(contrast, ms) {
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

  playStimulus = () => {
    var that = this;
    if (config.debug) {
      that.log_debug();
    }

    // If we've reached the end, then shutdown and return
    if (that.state.index == that.props.contrasts.length) {
      that.shutdown();
      return;
    }

    // Increment index and check if we hit maximum number of attempts,
    // in which case we stop early
    if (that.numAttempts++ == that.numAttemptsLimit) {
      that.setState({complete: true});
      return;
    }

    // Start time window for receiving a response
    that.setState({responseWindow: true});
    that.startTime = new Date().getTime();

    // Play stimuli
    const contrast = that.props.contrasts[that.state.index];
    playAuditoryStimulus(auditoryStim, that.audioContext);
    that.playVisualStimulus(contrast, STIMULUS_MS);

    this.stimulusTimer = setTimeout(this.playStimulus, that.delay + that.jitter());

    this.addTimestamp("stim");
  }

  startTrial() {
    this.setState({trialStarted: true});
    this.stimulusTimer = setTimeout(this.playStimulus, this.initialDelay);
    this.addTimestamp("start");
  }

  jitter() {
    return Math.random() / 2 * 1000; // in ms
  }

  shutdown() {
    this.addTimestamp("end");
    this.saveDataToStore();
    this.setState({complete: true});
  }

  saveDataToStore() {
    this.props.dataHandler(
      this.props.contrasts,
      this.response,
      this.responseTime,
      this.ratings,
      this.ratingsRaw,
      this.timestamps
    );
  }

  /********************************
   *                              *
   *        REACT HANDLERS        *
   *                              *
   ********************************/

  componentDidMount() {
    document.addEventListener("keydown", this.keyDownFunction, false);
    document.addEventListener("keyup", this.keyUpFunction, false);

    // If we don't have an id on file, then abort
    if (_.isUndefined(getEncryptedMetadata())) {
      this.setState({invalid: true});
    }

    if (this.state.complete === false) {
      // Oddly enough, we don't see the initial render unless
      // this is scheduled this way.
      setTimeout(() => {
        this.precomputeGabors();
        this.setState({readyToStart: true});
      }, 0);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyDownFunction, false);
    document.removeEventListener("keyup", this.keyUpFunction, false);

    this.audioContext.close();
  }

  render() {
    // Something went wrong, so we redirect to error page.
    if (this.state.invalid) {
      return <Redirect to="/Error" />
    } else if (this.state.dataSent) {
      // If we already sent out data, we're done.
      return <Redirect to="/ThankYou" />
    } else if (this.state.complete) {
      // If trial is complete, then we use the renderer passed in as a prop.
      // This renderer should take care of the redirect logic.

      return this.props.trialCompleteRenderer(this.props.contrasts, this.response);
    }

    return (
      <div className={"Trial " + (this.state.trialStarted ? "Trial-gray" : "")}>
        {this.state.trialStarted ? (
          <div className="Trial-stimulus">
            <VisualStimulus
              showContrast={this.state.showContrast}
              showRatings={this.state.ratingWindow}
              currentRating={this.state.currentRating}
              contrast={this.state.contrast}
              precomputedGabor={this.precomputedGabors[this.state.index]}
            />
          </div>
        ) : (

          <p className="Trial-text">
            {this.state.readyToStart ? (
              <span>Press any key to begin</span>
            ) : (
              <span>Loading...</span>
            )}
          </p>
        )}
      </div>
    );
  } // end render

  /********************************
   *                              *
   *        OTHER HANDLERS        *
   *                              *
   ********************************/

  keyDownFunction = (event) => {
    if (this.state.readyToStart) {
      this.setState({readyToStart: false});
      this.audioContext.resume();
      this.startTrial();
      return;
    }

    // First, check whether key is pressed for the first time or key is being
    // held down. If it's being held down we ignore it.
    if (_.includes([Q_KEY_CODE, E_KEY_CODE], event.keyCode)) {
      if (this.isKeyDown[event.keyCode]) {
        return;
      } else {
        this.isKeyDown[event.keyCode] = true;
      }
    }

    if (this.state.responseWindow && _.includes([Q_KEY_CODE, E_KEY_CODE], event.keyCode)) {
      // record timestamp
      this.addTimestamp("resp");

      var ms = new Date().getTime();

      // Record 1 as response if Q, record 0 if E
      const response = event.keyCode === Q_KEY_CODE ? 1 : 0;
      this.response.push(response);
      this.responseTime.push(ms - this.startTime);
      this.setState({responseWindow: false});

      // Remember to call handler, which is used by the Quest trial
      this.props.responseHandler(response);

      // If we're also recording ratings, then open the window
      // for receiving ratings
      if (this.props.shouldRecordRatings) {
        clearTimeout(this.stimulusTimer);
        this.setState({
          ratingWindow: true,
          currentRating: 1,
          stopShowingRating: false,
          stopIncrementingRating: false,
        });

        var that = this;
        var numIterations = 0;
        function scheduleRating() {
          numIterations++;
          that.ratingTimer = setTimeout(() => {
            if (numIterations == 5 || that.state.stopShowingRating) {
              that.finishRatingWindow();
              return;
            }
            if (!that.state.stopIncrementingRating) {
              that.setState({currentRating: that.state.currentRating + 1});
            }
            scheduleRating();
          }, 250);
        }

        this.ratingStartTime = new Date().getTime();
        scheduleRating();
      } else {
        // Otherwise, move on to the next index
        this.setState({index: this.state.index + 1});

        // Not ideal but we might have to compute these on the fly,
        // as is the case with the Quest trial.
        this.precomputeGabors();
      }
    }
  }

  keyUpFunction = (event) => {
    if (_.includes([Q_KEY_CODE, E_KEY_CODE], event.keyCode)) {
        this.isKeyDown[event.keyCode] = false;
    }

    if (this.state.ratingWindow) {
      // Get response key code
      const responseKeyCode = _.last(this.response) == 1 ? Q_KEY_CODE : E_KEY_CODE;
      if (responseKeyCode == event.keyCode) {
        this.addTimestamp("rating");

        var ms = new Date().getTime();
        this.ratingsRaw.push(ms - this.ratingStartTime);
        this.setState({stopIncrementingRating: true});
      }
    }
  };

  finishRatingWindow = () => {
    this.ratings.push(this.state.currentRating);

    if (this.ratings.length > this.ratingsRaw.length) {
      this.addTimestamp("rating");

      var ms = new Date().getTime();
      this.ratingsRaw.push(ms - this.ratingStartTime);
      this.setState({stopIncrementingRating: true});
    }

    this.setState({
      index: this.state.index + 1,
      ratingWindow: false,
    });
    this.precomputeGabors();
    this.stimulusTimer = setTimeout(this.playStimulus, 1000 + this.jitter());
  }

  // Debugging
  log_debug() {
    console.log('================================');
    console.log('all contrasts: ' + this.props.contrasts);
    console.log('all responses: ' + this.response);
    console.log('all responseTime: ' + this.responseTime);
    console.log('all timestamps: ' + JSON.stringify(this.timestamps));
    console.log('all ratingsRaw: ' + this.ratingsRaw);
    console.log('all ratings: ' + this.ratings);

    console.log('index: ' + this.state.index);
    console.log('numAttempts: ' + this.numAttempts);
    //console.log('store: ' + JSON.stringify(getStore()));
    //console.log('localStorage: ' + JSON.stringify(localStorage));
    console.log('================================\n');
  }
} // end class


Trial.defaultProps = {
  contrasts: config.debug ? _.shuffle([0, 0, 1, 1]) :
  _.concat([1], _.shuffle([0, 0, 0, 0, 0, 1, 1, 1, 1])),
  shouldRecordRatings: false,
  trialCompleteRenderer: _.noop,
  responseHandler: _.noop,
  dataHandler: _.noop,
}

Trial.propTypes = {
  contrasts: PropTypes.array.isRequired,
  shouldRecordRatings: PropTypes.bool,
  trialCompleteRenderer: PropTypes.func,
  responseHandler: PropTypes.func,
  dataHandler: PropTypes.func.isRequired,
}

export default Trial;
