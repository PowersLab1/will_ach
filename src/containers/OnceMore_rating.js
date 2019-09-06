import React, { Component } from 'react';
import './OnceMore_rating.css';
import { Redirect } from "react-router-dom";

class OnceMore_rating extends Component {

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
          return <Redirect to="/Trial_P_rating" />
        }

        return (
          <div className="OnceMore_rating">
            <input type="hidden"/>
            <header className="OnceMore_rating-header">
            <div className="text-container">
              <p className="OnceMore_rating-text">
              <br /><br /> Nice job, but you didn't reach the required accuracy level, so make sure you are pressing the right keys at the right time,
              <br /><br /> and holding the button down to indicate accuracy ratings. You will now have one more practice session. Get ready!
              <br /><br /><br /> PRESS "Q"/YES WHEN READY TO CONTINUE.

              </p>
            </div>
            </header>
          </div>
        );
      }
    }

export default OnceMore_rating;
