import React, { Component } from 'react';
import './Continue.css';
import { Redirect } from "react-router-dom";

class Continue extends Component {

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
          <div className="Continue">
            <header className="Continue-header">
            <div className="text-container">
              <p className="Continue-text">
                Congratulations
                <br /><br /> You have completed the first trial.
                <br /><br /> A visual white noise will be shown throughout the experiment.
                <br /><br /> A striped-texture will appear inside the white noise when a tone is played.
                <br /><br /> Press <b> "Q"/YES </b> if you <b> DO </b>see the stripes.
                <br /><br /> Press <b> "E"/NO </b> if you <b> DO NOT </b> see the stripes.
                <br /><br /> After you indicate <b> "Q"/YES </b> or  <b> "E"/NO </b> you  will see a rating screen.
                <br /><br /> Rate your certainty of your answer YES or NO by pressing number keys <b> 1 </b> ,  <b> 2 </b>,  <b> 3 </b>,  <b> 4 </b>  or  <b> 5 </b>
                <br /><br />  to indicate how certain you are of your answer.
                <br /><br /> 1 is MOST UNSURE and 5 is MOST CERTAIN.
                <br /><br /> Please respond as <b> QUICKLY </b> and as <b> ACCURATELY </b> as you <b> POSSIBLY CAN </b>
                <br /><br /><br /> PRESS "Q"/YES TO BEGIN THE EXPERIMENT.
              </p>
            </div>
            </header>
          </div>
        );
      }
    }

export default Continue;
