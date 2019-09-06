import React, { Component } from 'react';
import './Instructions.css';
import { Redirect } from "react-router-dom";

class Instructions extends Component {

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
          return <Redirect to="/Trial_P" />
        }

        return (
          <div className="Instructions">
            <input type="hidden"/>
            <header className="Instructions-header">
            <div className="text-container">
              <p className="Instructions-text">
              This is a hearing test.
              <br /><br /> Auditory white noise (like static radio) will be played throughout the experiment.
              <br /><br /> A tone might play while the white noise continues when there is a checkerboard on the screen.
              <br /><br />Only respond when you see the checkerboard.
              <br /><br /> Press  <font size="+2">  <b> "Q"/YES </b> </font> if you <b> DO </b>hear the tone.
              <br /><br /> Press <font size="+2"> <b> "E"/NO </b> </font> if you <b> DO NOT </b> hear the tone.
              <br /><br /> Please respond as <b> QUICKLY </b> and as <b> ACCURATELY </b> as you <b> POSSIBLY CAN </b>
              <br /><br /><br /> PRESS "Q"/YES TO BEGIN A SHORT PRACTICE SESSION
              </p>
            </div>
            </header>
          </div>
        );
      }
    }

export default Instructions;
