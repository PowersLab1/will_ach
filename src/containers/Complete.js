import React, { Component } from 'react';
import './Complete.css';
import { Redirect } from "react-router-dom";

class Complete extends Component {

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
      return <Redirect to="/Trial_TT_1" />
    }

    return (
      <div className="Complete">
        <header className="Complete-header">
        <div className="text-container">
          <p className="Complete-text">
            Congratulations!
            <br /><br /> First part of the experiment is over.
            <br /><br /> Now we will continue with the next trials. Now, there will be ratings similar to the second practice.
            <br /><br /> You will see a rating screen following each beep, press
            <br /><br /> and then hold the <b> "Q"/YES </b> button or <b> "E"/NO </b> button.
            <br /><br /> The longer you hold it down, the more certain you are of your choice.
            <br /><br /> If you hold <b> "Q"/YES </b>  button down for a long time, you are very certain that you  <b> DO </b> see the stripes.
            <br /><br /> If you hold <b> "E"/NO </b>  button down for a long time, you are very certain that you <b> DO NOT </b> see the stripes.
            <br /><br /> Please respond as <b> QUICKLY </b> and as <b> ACCURATELY </b> as you <b> POSSIBLY CAN </b>
            <br /><br /><br /> PRESS "Q"/YES WHEN READY TO CONTINUE.
          </p>
        </div>
        </header>
      </div>
    );
      }
    }


export default Complete;
