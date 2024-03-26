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
                This is a vision test.
                <br /><br /> A visual white noise will be shown throughout the experiment.
                <br /><br /> A striped-texture might appear inside the white noise when a tone is played.
                <br /><br />Only respond after you hear the beep.
                <br /><br /> Please keep your eyes focused on the <b>cross in the center</b> (don't look at the circle where the stripes may be)
                <br /><br /> Press  <font size="+2">  <b> "Q"/YES </b> </font> if you <b> DO </b>see the stripes.
                <br /><br /> Press <font size="+2"> <b> "E"/NO </b> </font> if you <b> DO NOT </b> see the stripes.
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
