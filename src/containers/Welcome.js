import React, { Component } from 'react';
import logo from "../media/psych_logo.jpg"
import './Welcome.css';
import {Redirect} from "react-router-dom";
import {setEncryptedMetadata, getEncryptedMetadata, getDataSent, setSurveyUrl} from '../store';

var qs = require('query-string');
var _ = require('lodash');

class Welcome extends Component {
  constructor(props) {
    super(props);
    this.keyFunction = this.keyFunction.bind(this);
    this.state = {
      continue: false,
      invalid: false,
      dataSent: false,
    }
  }

  keyFunction(event){
    if(event.keyCode === 81) {
      this.setState((state, props) => ({
        continue: true
      }));
    }
  }

  componentDidMount(){
    document.addEventListener("keydown", this.keyFunction, false);

    // Check if we're given an encrypted id
    const params = qs.parse(
      this.props.location.search,
      {ignoreQueryPrefix: true}
    );

    // Update encrypted metadata (param id)
    if (_.isUndefined(params.id)) {
      // If no metadata is passed in as a param AND we don't
      // have metadata saved in our store, then we can't proceed.
      // Show error page.
      if (_.isUndefined(getEncryptedMetadata())) {
        this.setState({invalid: true});
      }
    } else {
      // If metadata is passed in as a param, then we set it.
      setEncryptedMetadata(params.id);
    }

    if (!_.isUndefined(params.survey_url)) {
      setSurveyUrl(params.survey_url);
    }

    // After we update the id and data is still "sent",
    // then redirect.
    if (getDataSent()) {
      this.setState({dataSent: true});
    }
  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.keyFunction, false);
  }

  render() {
    if (this.state.invalid) {
      return <Redirect to="/Error" />
    } else if (this.state.dataSent) {
      // If we already sent out data, we're done.
      return <Redirect to="/ThankYou" />
    } else if (this.state.continue === true){
      return <Redirect to="/Instructions" />
    }

    return (
      <div className="Welcome">
        <input type="hidden"/>
        <header className="Welcome-header">
        <div className="text-container">
          <p className="Welcome-text">
            <span className="bigger"> Welcome to the study! </span>
            <br /><br /> In this task you will be asked to indicate whether you see stripes on the screen.
            <br /><br /> Please keep your eyes focused on the <b>cross in the center</b> (don't look at the circle where the stripes may be)
            <br /><br />Please enter responses to the questions asked by pressing the:
            <br /><br />  <font size="+2"> <b> 'Q' key for 'YES I SEE IT'</b> or <b> 'E' key for "NO I DO NOT'</b> </font>
            <br /><br /><br /><br /> Sometimes it may be difficult to answer, but if you do not know, please make your best guess.
            <br /><br /><br /><br /> Please keep your volume (including headphones) and screen brightness at maximum level throughout the experiment.
            <br /><br /><br /><br /> PRESS the <b> YES I SEE IT / 'Q' key </b> to CONTINUE

          </p>
        </div>
          <a
            href="https://medicine.yale.edu/psychiatry/care/cmhc/"
            title="Learn more about the Connecticut Mental Health Center"
            target="_blank"
            rel="noopener noreferrer"
          >
          <img src={logo} className="Site-link" alt="logo" />
          </a>

        </header>
      </div>
    );
  }
}

export default Welcome;
