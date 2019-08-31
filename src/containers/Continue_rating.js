import React, { Component } from 'react';
import './Continue_rating.css';
import { Redirect } from "react-router-dom";

class Continue_rating extends Component {

    constructor(props) {
        super(props);
      this.state = {
        continue: false,
      }
    }

    keyFunction = (event) => {
    if(event.keyCode === 81) {
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
        if(this.state.continue === true){
          return <Redirect to="/TrialQ" />
        }

      return (
        <div className="Continue_rating">
          <header className="Continue_rating-header">
          <div className="text-container">
            <p className="Continue_rating-text">
              Great!
              <br /><br /> You have completed the practice trials. Now onto the real test.
              <br /><br />  It is important to note that the tone in the practice session was there to make sure
              <br /><br />  you understood what to do, with very obvious and impossible-to-hear tones.
              <br /><br />  The tone in the remainder of the experiment
              <br /><br />  may be very difficult to hear so you will have to listen very hard.
              <br /><br />  Sometimes it might be difficult to answer, but if you do not know, please guess.
              <br /><br />  For this first task, you will not be asked to rate your confidence so just quickly press
              <br /><br />  and release the button as soon as the screen flashes with the checkerboard.
              <br /><br /> Press  <font size="+2">  <b> "Q"/YES </b> </font> if you <b> DO </b>hear the tone.
              <br /><br /> Press <font size="+2"> <b> "E"/NO </b> </font> if you <b> DO NOT </b> hear the tone.
              <br /><br /> Please respond as <b> QUICKLY </b> and as <b> ACCURATELY </b> as you <b> POSSIBLY CAN </b>
              <br /><br /> There will be scheduled breaks throughout the experiment, but please do not take a break unless instructed.
              <br /><br /><br /> PRESS "Q"/YES TO BEGIN THE EXPERIMENT.
            </p>
          </div>
          </header>
        </div>
      );
    }
}

export default Continue_rating;
