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
            Congratulations
            <br /><br /> Now we will continue with the next trials.
            <br /><br /> Press <b> "Q"/YES </b> if you <b> DO </b>see the stripes.
            <br /><br /> Press <b> "E"/NO </b> if you <b> DO NOT </b> see the stripes.
            <br /><br /> After you indicate <b> "Q"/YES </b> or  <b> "E"/NO </b> you  will see a rating screen.
            <br /><br /> Rate your certainty of your answer YES or NO by pressing number keys <b> 1 </b> ,  <b> 2 </b>,  <b> 3 </b>,  <b> 4 </b>  or  <b> 5 </b>
            <br /><br />  to indicate how certain you are of your answer.
            <br /><br /> 1 is MOST UNSURE and 5 is MOST CERTAIN.
            <br /><br /> Please respond as <b> QUICKLY </b> and as <b> ACCURATELY </b> as you <b> POSSIBLY CAN </b>
            <br /><br /><br /> PRESS "Q"/YES TO BEGIN THE NEXT TRIAL.
          </p>
        </div>
        </header>
      </div>
    );
      }
    }


export default Complete;
