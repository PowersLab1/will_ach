import React, {Component} from 'react';

import './Trial_TT_1.css';
import {Redirect} from "react-router-dom";
import Trial from './Trial';

import {setTrialData} from '../store';
import {create_blocks_singleton} from '../lib/tt_blocks';

var _ = require('lodash');

const TRIAL_NUM = 2;
const BLOCK_START = 3;
const BLOCK_END = 6; // not inclusive

class Trial_TT_2 extends Component {
  constructor(props) {
    super(props);

    // initial states
    this.state = {
      contrasts: _.flatten(
        _.slice(create_blocks_singleton(), BLOCK_START, BLOCK_END)
      ),
    };
  }

  trialCompleteRenderer = (contrasts, response) => {
    alert("Trial completed")
    return <Redirect to="/Break2" />
  }

  dataHandler = (contrasts, response, responseTime, ratings) => {
    setTrialData(
      TRIAL_NUM,
      contrasts,
      response,
      responseTime,
      ratings
    );
  }

  render() {
    // Something went wrong and we don't have contrast values from Quest.
    // Redirect to the beginning.
    if (_.isEmpty(this.state.contrasts)) {
      return <Redirect to="/Welcome" />
    }

    return (
      <Trial
        contrasts={this.state.contrasts}
        shouldRecordRatings={true}
        trialCompleteRenderer={this.trialCompleteRenderer}
        dataHandler={this.dataHandler}
      />
    );

  } // end render
} // end class

export default Trial_TT_2;
