import React, {Component} from 'react';

import './Trial_P_rating.css';
import {Redirect} from "react-router-dom";
import Trial from './Trial';

var _ = require('lodash');

class Trial_P_Rating extends Component {
  trialCompleteRenderer = (contrasts, response) => {
    alert("Trial completed");

    // count how many were correct
    let correct = 0;
    for (let i = 0; i < response.length; i++) {
      correct += response[i] == (contrasts[i] > 0);
    }

    console.log(contrasts);
    console.log(response);

    if (correct > 0.7 * contrasts.length) {
      return <Redirect to="/Continue_rating" />
    } else {
      return <Redirect to="/OnceMore_rating" />;
    }
  }

  render() {
    return (
      <Trial
        shouldRecordRatings={true}
        trialCompleteRenderer={this.trialCompleteRenderer}
        dataHandler={_.noop()}
      />
    );

  } // end render
} // end class

export default Trial_P_Rating;
