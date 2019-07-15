import React, { Component } from 'react';

import './TrialQ.css';
import { Redirect } from "react-router-dom";
import Trial from './Trial';

import { QuestCreate, QuestUpdate, QuestQuantile} from "../lib/Quest.js"
import {create_blocks_singleton} from '../lib/tt_blocks';
import {setQuestData, processAndStoreData, getProcessedData} from '../store';

var _ = require('lodash');

class TrialQ extends Component {
  constructor(props) {
    super(props);

    // initial states
    this.state = {
      contrasts: [],
    };

    //initializing QUEST
    let tGuess = 0.5,
      tGuessSd = 0.1,
      pThreshold = 0.75,
      beta = 3.5,
      delta = 0.01,
      gamma = 0.01,
      grain = 0.001,
      dim = 1000,
      range = 20;

    this.q1 = QuestCreate(tGuess, tGuessSd, pThreshold, beta, delta, gamma, grain, range);
    this.q2 = QuestCreate(tGuess, tGuessSd, pThreshold, beta, delta, gamma, grain, range);

    this.index = 0;
    this.maxIndex = 19;

    // Set initial state
    this.state = {
      contrasts: [tGuess + 0.3, tGuess - 0.3],
    };
  }

  pushContrast(contrast) {
    console.log('push: ' + contrast);
    this.setState({contrasts: [...this.state.contrasts, contrast]});
    console.log(this.state.contrasts);
  }

  responseHandler = (response) => {
    // By this point we're taking responses for the last 2 contrasts
    // we pushed. We won't need to push additional contrasts.
    if (this.index >= this.maxIndex - 1) {
      this.index++;
      return;
    }

    if (this.index % 2 == 0) {
      this.q1 = QuestUpdate(this.q1, this.state.contrasts[this.index], response);
      this.pushContrast(QuestQuantile(this.q1));
    } else {
      this.q2 = QuestUpdate(this.q2, this.state.contrasts[this.index], response);
      this.pushContrast(QuestQuantile(this.q2));
    }
    this.index++;
  }

  trialCompleteRenderer = () => {
    return <Redirect to="/Complete" />;
  }

  dataHandler = (contrasts, response, responseTime, ratings) => {
    // Even indices are for staircase 1, odd for staircase 2
    const contrasts_q1 = contrasts.filter((_, i) => i % 2 == 0);
    const response_q1 = response.filter((_, i) => i % 2 == 0);
    const responseTime_q1 = responseTime.filter((_, i) => i % 2 == 0);

    const contrasts_q2 = contrasts.filter((_, i) => i % 2 == 1);
    const response_q2 = response.filter((_, i) => i % 2 == 1);
    const responseTime_q2 = responseTime.filter((_, i) => i % 2 == 1);

    // Save staircase data
    setQuestData(
      contrasts_q1,
      response_q1,
      responseTime_q1,
      contrasts_q2,
      response_q2,
      responseTime_q2
    );

    // Process data
    processAndStoreData(this.q1, this.q2);
    const data = getProcessedData();

    // Also, generate TT blocks singleton here for later use.
    const intensities = this.props.data.trial1Struct.intensities[1];
    const c25 = intensities[0];
    const c50 = intensities[1];
    const c75 = intensities[2];

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
