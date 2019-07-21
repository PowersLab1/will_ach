import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './Trial.css';
import {beep} from "../lib/utils";
import {createStim, createGabor} from "../lib/Stim.js";
import VisualStimulus from './VisualStimulus';
import {Redirect} from "react-router-dom";

import {getStore, getEncryptedId, getDataSent} from '../store';


var _ = require('lodash');

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
      dataSent: getDataSent(),
    };

    // class props init
    this.canvasRef = React.createRef();
    this.audioContext = new AudioContext();
    this.initialDelay = 2000; // time until first stimulus, in ms
    this.delay = 3000; // time in between stimuli, in ms
    this.numAttempts = 0;
    this.numAttemptsLimit = 100;

    // user inputs
    this.response = [];
    this.responseTime = [];
    this.ratings = [];

    // time keeping
    this.startTime = 0;

    // Precompute gabor layers for performance
    // Specifically, we don't want our animation to pause while
    // trying to compute the gabor layer, which is an expensive operation.
    // So we instead compute them all in the beginning and then use them later.
    this.precomputedGabors = [];
  }

  precomputeGabors() {
    var stim = createStim();
    for (let i = 0; i < this.props.contrasts.length; i++) {
      if (_.isUndefined(this.precomputedGabors[i])) {
        this.precomputedGabors[i] = createGabor(stim, this.props.contrasts[i]);
      }
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

  playAuditoryStimulus(amp, ms) {
    beep(amp /* amp */, 830 /* freq */, ms /* ms */, this.audioContext);
  }

  startTrial() {
    this.setState({trialStarted: true});

    var that = this;
    function playStimulus() {
      that.log_debug();

      // If we've reached the end, then shutdown and return
      if (that.state.index == that.props.contrasts.length) {
        that.shutdown();
        return;
      }

      // If we got a response but not a rating, then we'll keep the
      // window open and reschedule the stimulus.
      if (that.state.ratingWindow) {
        setTimeout(playStimulus, 2000);
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
      that.startTime = new Date().getTime() / 1000;

      // Play stimuli
      const contrast = that.props.contrasts[that.state.index];
      that.playAuditoryStimulus(50, STIMULUS_MS);
      that.playVisualStimulus(contrast, STIMULUS_MS);

      setTimeout(playStimulus, that.delay + that.jitter());
    }
    setTimeout(playStimulus, that.initialDelay);
  }

  jitter() {
    return Math.random() / 2 * 1000; // in ms
  }

  shutdown() {
    this.saveDataToStore();
    this.setState({complete: true});
  }

  saveDataToStore() {
    this.props.dataHandler(
      this.props.contrasts,
      this.response,
      this.responseTime,
      this.ratings
    );
  }

  /********************************
   *                              *
   *        REACT HANDLERS        *
   *                              *
   ********************************/

  componentDidMount() {
    document.addEventListener("keydown", this.keyFunction, false);

    // If we don't have an id on file, then abort
    if (_.isUndefined(getEncryptedId())) {
      this.setState({invalid: true});
    }

    if (this.state.complete === false) {
      // Oddly enough, we don't see the initial render unless
      // this is scheduled this way.
      setTimeout(() => {
        this.precomputeGabors();
        this.startTrial();
      }, 0);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyFunction, false);
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
      <div className="Trial">
        {this.state.trialStarted ? (
          <div>
            <VisualStimulus
              showContrast={this.state.showContrast}
              showRatings={this.state.ratingWindow}
              contrast={this.state.contrast}
              precomputedGabor={this.precomputedGabors[this.state.index]}
            />
            <p className="Trial-progress">
              {this.state.index == this.props.contrasts.length ? (
                <span>Complete. Please wait...</span>
              ) : (
                <span>#{this.state.index + 1}</span>
              )}
            </p>
          </div>
        ) : (
          <p className="Trial-text">
            Loading...
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

  keyFunction = (event) => {
    if (this.state.responseWindow && _.includes([Q_KEY_CODE, E_KEY_CODE], event.keyCode)) {
      var seconds = new Date().getTime() / 1000;

      // Record 1 as response if Q, record 0 if E
      const response = event.keyCode === Q_KEY_CODE ? 1 : 0;
      this.response.push(response);
      this.responseTime.push(seconds - this.startTime);
      this.setState({responseWindow: false});

      // Remember to call handler, which is used by the Quest trial
      this.props.responseHandler(response);

      // If we're also recording ratings, then open the window
      // for receiving ratings
      if (this.props.shouldRecordRatings) {
        this.setState({ratingWindow: true});
      } else {
        // Otherwise, move on to the next index
        this.setState({index: this.state.index + 1});

        // Not ideal but we might have to compute these on the fly,
        // as is the case with the Quest trial.
        this.precomputeGabors();
      }
    } else if (this.state.ratingWindow && _.includes(RATING_KEY_CODES, event.keyCode)) {
      this.ratings.push(KEY_CODE_TO_RATING[event.keyCode]);
      this.setState({
        index: this.state.index + 1,
        ratingWindow: false,
      });
      this.precomputeGabors();
    }
  }

  // Debugging
  log_debug() {
    console.log('================================');
    console.log('all contrasts: ' + this.props.contrasts);
    console.log('all responses: ' + this.response);
    console.log('all responseTime: ' + this.responseTime);
    console.log('all ratings: ' + this.ratings);

    console.log('index: ' + this.state.index);
    console.log('numAttempts: ' + this.numAttempts);
    console.log('store: ' + JSON.stringify(getStore()));
    console.log('sessionStorage: ' + JSON.stringify(sessionStorage));
    console.log('================================\n');
  }
} // end class


Trial.defaultProps = {
  // contrasts: _.shuffle([0, 0, 0, 0, 0, 1, 1, 1, 1, 1]),
  contrasts: _.shuffle([0]),
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
