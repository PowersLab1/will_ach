import React, { Component } from 'react';
import './Break2.css';
import { Redirect } from "react-router-dom";

class Break2 extends Component {

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
          return <Redirect to="/Trial_TT_3" />
        }

        return (
          <div className="Break">
            <input type="hidden"/>
            <header className="Break-header">
            <div className="text-container">
              <p className="Break-text">
                This is a vision test.
                <br /><br /> Great!!! Take a quick break.Two more to go!
                <br /><br /> Remember: Continue to look carefully and do the best you can.
                <br /><br /> The task will continue to be difficult, but it is okay to guess and it is okay to be uncertain.
                <br /><br /> Press <b> "Q"/YES </b> if you <b> DO </b>see the stripes.
                <br /><br /> Press <b> "E"/NO </b> if you <b> DO NOT </b> see the stripes.
                <br /><br /> Please respond as <b> QUICKLY </b> and as <b> ACCURATELY </b> as you <b> POSSIBLY CAN </b>
                <br /><br /><br /> PRESS "Q"/YES TO CONTINUE WITH THE NEXT PART

              </p>
            </div>
            </header>
          </div>
        );
      }
    }

export default Break2;
