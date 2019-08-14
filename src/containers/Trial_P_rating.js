import React, {Component} from 'react';

import {setComponentData} from '../store';
import {Redirect} from "react-router-dom";
import Trial from './Trial';

var _ = require('lodash');

class Trial_P_Rating extends Component {
  constructor(props) {
    super(props);
    this.startTimestamp = new Date().getTime();
  }

  trialCompleteRenderer = (contrasts, response) => {
    // count how many were correct
    let correct = 0;
    for (let i = 0; i < response.length; i++) {
      correct += response[i] == (contrasts[i] > 0);
    }

    if (correct > 0.7 * contrasts.length) {
      return <Redirect to="/Continue_rating" />
    } else {
      return <Redirect to="/OnceMore_rating" />;
    }
  }

  dataHandler = (contrasts, response, responseTime, ratings, ratingsRaw, timestamps) => {
    setComponentData(
      "practice_rating",
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
    return (
      <Trial
        shouldRecordRatings={true}
        trialCompleteRenderer={this.trialCompleteRenderer}
        dataHandler={this.dataHandler}
      />
    );

  } // end render
} // end class

export default Trial_P_Rating;
