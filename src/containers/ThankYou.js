import React, { Component } from 'react';
import logo from "../media/psych_logo.jpg"
import './ThankYou.css';
import { Redirect } from "react-router-dom";
import {
  getStoreExport,
  isStoreComplete,
  clearStore,
  clearTaskData,
  getEncryptedMetadata,
  setDataSent,
  getDataSent,
  getSurveyUrl,
} from '../store';
import {isLocalhost} from "../lib/utils";
import {aws_saveTaskData, aws_fetchLink} from "../lib/aws_lambda";

const config = require('../config');
var _ = require('lodash');

class ThankYou extends Component {
  constructor(props) {
    super(props);
    this.state = {
      continue: false,
      invalid: false,
      sentData: false,
      link: undefined,
    };
  }

  keyFunction = (event) => {
    // 81 is 'Q'
    if (event.keyCode === 81) {
        this.setState((state, props) => ({
          continue: true
        })
      );
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.keyFunction, false);

    const encryptedMetadata = getEncryptedMetadata();
    const storeExport = getStoreExport();

    // Load up link if not localhost
    if (!isLocalhost) {
      if (_.isUndefined(getSurveyUrl())) {
        aws_fetchLink(encryptedMetadata).then(
          (link) => this.setState({link: link})
        );
      } else {
        this.setState({link: getSurveyUrl()});
      }

    } else {
      this.setState({link: "link"});
    }

    // If we already sent data, nothing to do.
    if (getDataSent()) {
      this.setState({sentData: true});
      return;
    }

    if (config.debug) {
      console.log("encrypted metadata: " + encryptedMetadata);
      console.log("store export: " + storeExport);
      console.log('localStorage: ' + JSON.stringify(localStorage));
    }

    // Send data, only if it is complete
    if (!isStoreComplete()) {
      // Store isn't complete so something went wrong. Clear the whole store.
      clearStore();
      this.setState({invalid: true});
      return;
    }

    // don't send data if we're testing locally
    if (isLocalhost) {
      // If localhost, just mark data as sent
      setDataSent(true);
      this.setState({sentData: true});
      clearTaskData();
      return;
    }

    // Send request and mark data as sent
    aws_saveTaskData(encryptedMetadata, storeExport).then(
      () => {
        setDataSent(true);
        this.setState({sentData: true});

        // Since we're using localStorage to persist information,
        // we clear trial data after we send so it doesn't linger.
        // However, we do keep the id and dataSent so that
        // the user knows the data is sent even if the link is
        // reaccessed.
        clearTaskData();
      }
    );
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.keyFunction, false);
  }

  render() {
    if (this.state.invalid) {
      return <Redirect to="/Error" />
    } else if (this.state.continue) {
      window.location.assign(this.state.link);
    } else if (!this.state.sentData || _.isUndefined(this.state.link)) {
      return (
        <div className="ThankYou">
          <p className="ThankYou-text">
            Loading... (if stuck her for more than 30s try refreshing a few  times)
          </p>
        </div>
      );
    }

    return (
      <div className="ThankYou">
        <input type="hidden"/>
        <header className="ThankYou-header">
        <div className="text-container">
          <p className="ThankYou-text">
            <span className="bigger"> You finished the game! Thank you for helping science! </span>
            <br /><br /> Please <a href={this.state.link}>click here</a> or press 'Q' to return to the survey.
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

export default ThankYou;
