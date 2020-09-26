import React, { Component } from "react";
import PropTypes from "prop-types";

import "./Trial.css";
import {
  patch,
  auditoryStim,
  playAuditoryStimulus,
  playWhiteNoise,
  playPinkNoise,
  playBrownianNoise,
} from "../lib/Stim.js";
import VisualStimulus from "./VisualStimulus";
import { Redirect } from "react-router-dom";

import { getStore, getEncryptedMetadata, getDataSent } from "../store";

var _ = require("lodash");
const config = require("../config");
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
const RATING_KEY_CODES = _.map(_.keys(KEY_CODE_TO_RATING), (k) =>
  parseInt(k, 10)
);
const VISUAL_STIMULUS_MS = 1000;
const STIMULUS_MS = 1000;

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
    this.timebox = null;
    this.numIterations = 0;

    // keydown status
    this.isKeyDown = {
      Q_KEY_CODE: false,
      E_KEY_CODE: false,
    };
    this.prevKey = null;
  }

  addTimestamp(eventName) {
    if (eventName == "start") {
      this.componentStartTime = new Date().getTime();
      this.timestamps.push([eventName, 0]);
    } else {
      this.timestamps.push([
        eventName,
        new Date().getTime() - this.componentStartTime,
      ]);
    }
  }

  /********************************
   *                              *
   *        STIMULI LOGIC         *
   *                              *
   ********************************/

  playVisualStimulus(ms) {
    this.setState({
      showContrast: true,
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
    if (that.state.index == that.props.decibels.length) {
      that.shutdown();
      return;
    }

    // Increment index and check if we hit maximum number of attempts,
    // in which case we stop early
    if (that.numAttempts++ == that.numAttemptsLimit) {
      that.setState({ complete: true });
      return;
    }

    // Start time window for receiving a response
    that.setState({ responseWindow: true });
    that.startTime = new Date().getTime();

    // Play stimuli
    that.playVisualStimulus(VISUAL_STIMULUS_MS);
    const amp = that.props.decibels[that.state.index];
    playAuditoryStimulus(auditoryStim, that.audioContext, STIMULUS_MS, amp);

    this.stimulusTimer = setTimeout(
      this.playStimulus,
      that.delay + that.jitter()
    );

    this.addTimestamp("stim");
  };

  startTrial() {
    this.setState({ trialStarted: true });
    this.stimulusTimer = setTimeout(this.playStimulus, this.initialDelay);
    playWhiteNoise(this.audioContext);
    //playBrownianNoise(this.audioContext);
    //playPinkNoise(this.audioContext);

    this.addTimestamp("start");
  }

  jitter() {
    return (Math.random() / 2) * 1000; // in ms
  }

  shutdown() {
    this.addTimestamp("end");
    this.saveDataToStore();
    this.setState({ complete: true });
  }

  saveDataToStore() {
    this.props.dataHandler(
      this.props.decibels,
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
      this.setState({ invalid: true });
    }

    if (this.state.complete === false) {
      // Oddly enough, we don't see the initial render unless
      // this is scheduled this way.
      setTimeout(() => {
        this.setState({ readyToStart: true });
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
      return <Redirect to="/Error" />;
    } else if (this.state.dataSent) {
      // If we already sent out data, we're done.
      return <Redirect to="/ThankYou" />;
    } else if (this.state.complete) {
      // If trial is complete, then we use the renderer passed in as a prop.
      // This renderer should take care of the redirect logic.

      return this.props.trialCompleteRenderer(
        this.props.decibels,
        this.response
      );
    }

    return (
      <div className={"Trial " + (this.state.trialStarted ? "Trial-gray" : "")}>
        {this.state.trialStarted ? (
          <div className="Trial-stimulus">
            <VisualStimulus
              showContrast={this.state.showContrast}
              showRatings={this.state.ratingWindow}
              currentRating={this.state.currentRating}
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

  recordResponse = (event) => {
    if (
      this.state.responseWindow &&
      _.includes([Q_KEY_CODE, E_KEY_CODE], event.keyCode)
    ) {
      var that = this;

      // record timestamp
      this.addTimestamp("resp");

      var ms = new Date().getTime();

      // Record 1 as response if Q, record 0 if E
      const response = event.keyCode === Q_KEY_CODE ? 1 : 0;
      this.response.push(response);
      this.responseTime.push(ms - this.startTime);
      this.setState({ responseWindow: false });
      this.timebox = null;

      // Remember to call handler, which is used by the Quest trial
      this.props.responseHandler(response);

      // If we're also recording ratings, then open the window
      // for receiving ratings
      if (this.props.shouldRecordRatings) {
        clearTimeout(this.stimulusTimer);
        this.setState({
          ratingWindow: true,
          currentRating: that.numIterations || 1,
          stopShowingRating: false,
          stopIncrementingRating: false,
        });

        that.numIterations = that.numIterations || 0;
        function scheduleRating() {
          that.numIterations++;
          that.ratingTimer = setTimeout(() => {
            if (that.numIterations == 5 || that.state.stopShowingRating) {
              that.numIterations = 0;
              that.prevKey = null;

              that.finishRatingWindow();
              return;
            }
            if (!that.state.stopIncrementingRating) {
              that.setState({ currentRating: that.state.currentRating + 1 });
            }
            scheduleRating();
          }, 250);
        }

        this.ratingStartTime = new Date().getTime();
        scheduleRating();
      } else {
        // Otherwise, move on to the next index
        this.prevKey = null;
        this.setState({ index: this.state.index + 1 });
      }
    } else {
      this.prevKey = null;
    }
  };

  keyDownFunction = (event) => {
    if (this.state.readyToStart) {
      this.setState({ readyToStart: false });
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

    if (this.prevKey === null) {
      this.prevKey = event.keyCode;
    }

    if (this.prevKey !== event.keyCode) return;

    clearTimeout(this.timebox);
    this.timebox = setTimeout(() => {
      this.setState({ stopIncrementingRating: false });
      this.recordResponse(event);
    }, 50);
  };

  keyUpFunction = (event) => {
    if (_.includes([Q_KEY_CODE, E_KEY_CODE], event.keyCode)) {
      this.isKeyDown[event.keyCode] = false;
    }

    this.setState({ stopIncrementingRating: true });
    if (this.state.ratingWindow) {
      if (this.timebox) {
        setTimeout(() => {
          this.timebox = null;
          this.prevKey = null;
        }, 250);
      } else {
        // Get response key code
        const responseKeyCode =
          _.last(this.response) == 1 ? Q_KEY_CODE : E_KEY_CODE;
        if (responseKeyCode == event.keyCode) {
          this.addTimestamp("rating");

          var ms = new Date().getTime();
          this.ratingsRaw.push(ms - this.ratingStartTime);
        }
      }
    }
  };

  finishRatingWindow = () => {
    this.ratings.push(this.state.currentRating);

    if (this.ratings.length > this.ratingsRaw.length) {
      this.addTimestamp("rating");

      var ms = new Date().getTime();
      this.ratingsRaw.push(ms - this.ratingStartTime);
      this.setState({ stopIncrementingRating: true });
    }

    this.setState({
      index: this.state.index + 1,
      ratingWindow: false,
    });
    this.stimulusTimer = setTimeout(this.playStimulus, 1000 + this.jitter());
  };

  // Debugging
  log_debug() {
    console.log("================================");
    console.log("all decibels: " + this.props.decibels);
    console.log("all responses: " + this.response);
    console.log("all responseTime: " + this.responseTime);
    console.log("all timestamps: " + JSON.stringify(this.timestamps));
    console.log("all ratingsRaw: " + this.ratingsRaw);
    console.log("all ratings: " + this.ratings);

    console.log("index: " + this.state.index);
    console.log("numAttempts: " + this.numAttempts);
    console.log("store: " + JSON.stringify(getStore()));
    console.log("localStorage: " + JSON.stringify(localStorage));
    console.log("================================\n");
  }
} // end class

Trial.defaultProps = {
  decibels: config.debug
    ? _.shuffle([65, 65, 65, 65])
    : _.concat([65], _.shuffle([0, 0, 0, 0, 0, 65, 65, 65, 65])),
  shouldRecordRatings: false,
  trialCompleteRenderer: _.noop,
  responseHandler: _.noop,
  dataHandler: _.noop,
};

Trial.propTypes = {
  decibels: PropTypes.array.isRequired,
  shouldRecordRatings: PropTypes.bool,
  trialCompleteRenderer: PropTypes.func,
  responseHandler: PropTypes.func,
  dataHandler: PropTypes.func.isRequired,
};

export default Trial;
