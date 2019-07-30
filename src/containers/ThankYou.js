import React, { Component } from 'react';
import logo from "../media/psych_logo.jpg"
import './ThankYou.css';
import { Redirect } from "react-router-dom";
import {
  getEncryptedStore,
  isStoreComplete,
  clearStore,
  clearTaskData,
  getEncryptedMetadata,
  setDataSent,
  getDataSent,
} from '../store';
import {isLocalhost} from "../lib/utils";
import {aws_saveTaskData, aws_fetchLink} from "../lib/aws_lambda";

const config = require('../config');
var _ = require('lodash');

// Char limit for data store, as determined by redcap fields
const CHAR_LIMIT = 65535;

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
    const encryptedStore = getEncryptedStore();

    // Load up link if not localhost
    if (!isLocalhost) {
      aws_fetchLink(encryptedMetadata).then(
        (link) => this.setState({link: link})
      );
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
      console.log("encrypted store: " + encryptedStore);
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

    // If store is too big, then abort
    if (encryptedStore.length > CHAR_LIMIT) {
      throw "Store is too big";
    }

    // Send request and mark data as sent
    aws_saveTaskData(encryptedMetadata, encryptedStore).then(
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
      window.location.assign(this.state.link); // this is clearly wrong
    } else if (!this.state.sentData || _.isUndefined(this.state.link)) {
      return (
        <div className="ThankYou">
          <p className="ThankYou-text">
            Loading...
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
            <span className="bigger">Thank you for taking part in the study! </span>
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
