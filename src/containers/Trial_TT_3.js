import React, {Component} from 'react';

import {Redirect} from "react-router-dom";
import Trial from './Trial';

import {setComponentData} from '../store';
import {create_blocks_singleton} from '../lib/tt_blocks';

var _ = require('lodash');

const TRIAL_NUM = 3;
const BLOCK_START = 6;
const BLOCK_END = 9; // not inclusive

class Trial_TT_3 extends Component {
  constructor(props) {
    super(props);

    // initial states
    this.startTimestamp = new Date().getTime();
    this.state = {
      contrasts: _.flatten(
        _.slice(create_blocks_singleton(), BLOCK_START, BLOCK_END)
      ),
    };
  }

  trialCompleteRenderer = (contrasts, response) => {
    return <Redirect to="/Break3" />
  }

  dataHandler = (contrasts, response, responseTime, ratings, ratingsRaw, timestamps) => {
    setComponentData(
      TRIAL_NUM,
      contrasts,
      response,
      responseTime,
      ratings,
      ratingsRaw,
      timestamps,
      this.startTimestamp
    );
  }

  render() {
    // Something went wrong and we don't have contrast values from Quest.
    if (_.isEmpty(this.state.contrasts)) {
      return <Redirect to="/Error" />
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

export default Trial_TT_3;
