import React, { Component } from 'react';
import logo from "../media/psych_logo.jpg"
import './ThankYou.css';
import { Redirect } from "react-router-dom";
import {
  getEncryptedStore,
  isStoreComplete,
  clearStore,
  clearTrialData,
  getEncryptedId,
  setDataSent,
  getDataSent,
} from '../store';
import {isLocalhost} from "../lib/utils";

var https = require('https');
var querystring = require('querystring');
const config = require('../config');

const AWS_LAMBDA_HOST = config.awsLambda.host;
const AWS_LAMBDA_PATH = config.awsLambda.path;

class ThankYou extends Component {
  constructor(props) {
    super(props);
    this.state = {
      continue: false,
      invalid: false,
      loading: true,
    };
  }

  keyFunction = (event) => {
    if (event.keyCode === 81) {
        this.setState((state, props) => ({
          continue: true
        })
      );
    }
  }

  componentDidMount() {
     // Send data here, only if it is complete
    document.addEventListener("keydown", this.keyFunction, false);

    // If we already sent data, nothing to do.
    if (getDataSent()) {
      this.setState({loading: false});
      return;
    }

    if (config.debug) {
      console.log("encrypted store: " + getEncryptedStore());
      console.log('localStorage: ' + JSON.stringify(localStorage));
    }

    // Sanity check data
    if (isStoreComplete()) {
      // don't send data if we're testing locally
      if (!isLocalhost) {
        // Send request and mark data as sent
        sendRequest(getEncryptedId(), getEncryptedStore()).then(
          () => {
            setDataSent(true);
            this.setState({loading: false});

            // Since we're using localStorage to persist information,
            // we clear trial data after we send so it doesn't linger.
            // However, we do keep the id and dataSent so that
            // the user knows the data is sent even if the link is
            // reaccessed.
            clearTrialData();
          }
        );
      } else {
        // If localhost, just mark data as sent
        setDataSent(true);
        this.setState({loading: false});
        clearTrialData();
      }
    } else {
      // Store isn't complete so something went wrong. Clear the whole store.
      clearStore();
      this.setState({invalid: true});
    }
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.keyFunction, false);
  }

  render() {

    if (this.state.invalid) {
      return <Redirect to="/Error" />
    } else if (this.state.continue) {
      return <Redirect to="/Trial_TT_1" /> // this is clearly wrong
    } else if (this.state.loading) {
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
            <br /><br /> Check your email for the next step.
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

// Helpers
function sendRequest(encryptedId, data) {
  return new Promise(function(resolve, reject) {
    // Call api endpoint for update
    const postData = querystring.stringify({
        encrypted_id: encryptedId,
        data: data,
    });

    const postOptions = {
      hostname: AWS_LAMBDA_HOST,
      port: 443,
      path: AWS_LAMBDA_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(postOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', () => {});
      res.on('end', () => resolve(true));
    });

    req.on('error', (e) => {
      if (config.debug) {
        console.log("ERROR:");
        console.log(e);
      }
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}
