import React, {Component} from 'react';

import {Redirect} from "react-router-dom";
import Trial from './Trial';

import {setComponentData} from '../store';
import {create_blocks_singleton} from '../lib/tt_blocks';

var _ = require('lodash');
const config = require('../config');

const TRIAL_NUM = 1;
const BLOCK_START = 0;
const BLOCK_END = 3; // not inclusive

class Trial_TT_1 extends Component {
  constructor(props) {
    super(props);

    // initial states
    this.startTimestamp = new Date().getTime();
    this.state = {
      amplitudes: _.flatten(
        _.slice(create_blocks_singleton(), BLOCK_START, BLOCK_END)
      ),
    };
  }

  trialCompleteRenderer = (amplitudes, response) => {
    // If debugging, then we're done here
    if (config.debug) {
    //  return <Redirect to="/ThankYou" />
      return <Redirect to="/Break1" />
    } else {
      return <Redirect to="/Break1" />
    }
  }

  dataHandler = (amplitudes, response, responseTime, ratings, ratingsRaw, timestamps) => {
    setComponentData(
      TRIAL_NUM,
      amplitudes,
      response,
      responseTime,
      ratings,
      ratingsRaw,
      timestamps,
      this.startTimestamp
    );
  }

  render() {
    // Something went wrong and we don't have amplitudes values from Quest.
    if (_.isEmpty(this.state.amplitudes)) {
      return <Redirect to="/Error" />
    }

    return (
      <Trial
        amplitudes={this.state.amplitudes}
        shouldRecordRatings={true}
        trialCompleteRenderer={this.trialCompleteRenderer}
        dataHandler={this.dataHandler}
      />
    );

  } // end render
} // end class

export default Trial_TT_1;
