import React, { Component } from 'react';
import './OnceMore_rating.css';
import { Redirect } from "react-router-dom";

class OnceMore_rating extends Component {

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

        if(this.state.continue === true){
          return <Redirect to="/Trial_P_rating" />
        }

        return (
          <div className="OnceMore_rating">
            <input type="hidden"/>
            <header className="OnceMore_rating-header">
            <div className="text-container">
              <p className="OnceMore_rating-text">
                <br /><br /> Good job! Now let's practice once more.
                <br /><br /> A striped-texture will appear inside the white noise when a tone is played.
                <br /><br /> Press <b> "Q"/YES </b> if you <b> DO </b>see the stripes.
                <br /><br /> Press <b> "E"/NO </b> if you <b> DO NOT </b> see the stripes.
                <br /><br /> Please respond as <b> QUICKLY </b> and as <b> ACCURATELY </b> as you <b> POSSIBLY CAN </b>
                <br /><br /><br /> PRESS "Q"/YES TO BEGIN A SHORT PRACTICE SESSION

              </p>
            </div>
            </header>
          </div>
        );
      }
    }

export default OnceMore_rating;
