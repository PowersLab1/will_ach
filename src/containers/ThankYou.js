import React, { Component } from 'react';
import logo from "../media/psych_logo.jpg"
import './ThankYou.css';
import { connect } from 'react-redux'
import { Redirect } from "react-router-dom";

class ThankYou extends Component {

    constructor(props) {
        super(props);
      this.keyFunction = this.keyFunction.bind(this);
      this.state = {
        continue: false,
      }
    }

    keyFunction(event){
    if(event.keyCode === 81) {
      alert("User has Requested to Continue");
      this.setState((state, props) => ({
        continue: true
      }));
    }
  }

   componentDidMount(){
    document.addEventListener("keydown", this.keyFunction, false);
  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.keyFunction, false);
  }


      render() {
        console.log(this.props.data);

        if(this.state.continue === true){
      return <Redirect to="/Trial_TT_1" />
    }

    return (
      <div className="ThankYou">
        <input type="hidden"/>
        <header className="ThankYou-header">
        <div className="text-container">
          <p className="Welcome-text">
            <span className="bigger">Thank you for taking part in the study! </span>
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

const mapStateToProps = state => ({
  data: state.data,
})

export default connect(mapStateToProps)(ThankYou)
