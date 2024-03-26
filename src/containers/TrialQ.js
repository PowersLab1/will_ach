import React, { Component } from 'react';

import './TrialQ.css';
import { Redirect } from "react-router-dom";
import Trial from './Trial';

import {create_blocks_singleton} from '../lib/tt_blocks';
import {setQuestData, processAndStoreData, getProcessedData} from '../store';

var questlib = require('questlib');
const config = require('../config');

class TrialQ extends Component {
  constructor(props) {
    super(props);

    // initial states
    this.startTimestamp = new Date().getTime();
    this.state = {
      contrasts: [],
    };

    // Initializing QUEST
    // NOTE: Modify your quest parameters here!
    let tGuess1 = Math.log10(0.23),
      tGuess2 = Math.log10(0.23),
      tGuessSd = 0.1,
      pThreshold = 0.75,
      beta = 3,
      delta = 0.01,
      gamma = 0.01,
      grain = 0.001,
      dim = 1000, // Never used? what??
      range = 20;

    this.q1 = new questlib.Quest(tGuess1, tGuessSd, pThreshold, beta, delta, gamma, grain, range);
    this.q2 = new questlib.Quest(tGuess2, tGuessSd, pThreshold, beta, delta, gamma, grain, range);

    // NOTE: Specify how many trials to run for each staircase here.
    // E.g., numTrialsPerStaircase = 40 means 80 trials total,
    // 40 per staircase.
    const numTrialsPerStaircase = config.debug ? 5 : 40;

    // Final bit of initialization
    this.index = 0;
    this.maxIndex = numTrialsPerStaircase * 2 - 1;
    this.state = {
      contrasts: [Math.pow(10,tGuess1), Math.pow(10,tGuess2)],
    };
  }

  pushContrast(contrast) {
    this.setState({contrasts: [...this.state.contrasts, contrast]});
  }

  responseHandler = (response) => {
    // By this point we're taking responses for the last 2 contrasts
    // we pushed. We won't need to push additional contrasts.
    if (this.index >= this.maxIndex - 1) {
      this.index++;
      return;
    }

    if (this.index % 2 === 0) {
      this.q1.update(Math.log10(this.state.contrasts[this.index]), response);
      this.pushContrast(Math.pow(10,this.q1.quantile()));
    } else {
      this.q2.update(Math.log10(this.state.contrasts[this.index]), response);
      this.pushContrast(Math.pow(10,this.q2.quantile()));
    }
    this.index++;
  }

  trialCompleteRenderer = () => {
    return <Redirect to="/Complete" />;
  }

  dataHandler = (contrasts, response, responseTime, ratings, ratingsRaw, timestamps) => {
    // Even indices are for staircase 1, odd for staircase 2
    const contrasts_q1 = contrasts.filter((_, i) => i % 2 === 0);
    const response_q1 = response.filter((_, i) => i % 2 === 0);
    const responseTime_q1 = responseTime.filter((_, i) => i % 2 === 0);

    const contrasts_q2 = contrasts.filter((_, i) => i % 2 === 1);
    const response_q2 = response.filter((_, i) => i % 2 === 1);
    const responseTime_q2 = responseTime.filter((_, i) => i % 2 === 1);

    // Save staircase data
    setQuestData(
      this.q1,
      this.q2,
      contrasts_q1,
      response_q1,
      responseTime_q1,
      contrasts_q2,
      response_q2,
      responseTime_q2,
      timestamps,
      this.startTimestamp
    );

    // Process data
    processAndStoreData(this.q1, this.q2);
    const data = getProcessedData();

    // Also, generate TT blocks singleton here for later use.
    const c25 = Math.pow(10,data.intensities.c25);
    const c50 = Math.pow(10,data.intensities.c50);
    const c75 = Math.pow(10,data.intensities.c75);

    create_blocks_singleton(c25, c50, c75);
  }

  render() {
    return (
      <Trial
        contrasts={this.state.contrasts}
        shouldRecordRatings={false}
        trialCompleteRenderer={this.trialCompleteRenderer}
        dataHandler={this.dataHandler}
        responseHandler={this.responseHandler}
      />
    );

  } // end render
} // end class

export default TrialQ;
