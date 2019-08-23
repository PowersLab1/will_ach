import React, {Component} from 'react';

import {Redirect} from "react-router-dom";
import Trial from './Trial';
import {setComponentData} from '../store';

var _ = require('lodash');

class Trial_P extends Component {
  constructor(props) {
    super(props);
    this.startTimestamp = new Date().getTime();
  }

  trialCompleteRenderer = (decibels, response) => {
    // count how many were correct
    let correct = 0;
    for (let i = 0; i < response.length; i++) {
      correct += response[i] == (decibels[i] > 0);
    }

    if (correct > 0.7 * decibels.length) {
      return <Redirect to="/Continue" />
    } else {
      return <Redirect to="/OnceMore" />;
    }
  }

  dataHandler = (decibels, response, responseTime, ratings, ratingsRaw, timestamps) => {
    setComponentData(
      "practice",
      decibels,
      response,
      responseTime,
      undefined, // no ratings
      undefined, // no ratings
      timestamps,
      this.startTimestamp
    );
  }

  render() {
    return (
      <Trial
        shouldRecordRatings={false}
        trialCompleteRenderer={this.trialCompleteRenderer}
        dataHandler={this.dataHandler}
      />
    );

  } // end render
} // end class

export default Trial_P;
