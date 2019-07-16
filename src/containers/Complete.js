import React, { Component } from 'react';
import './Complete.css';
import { Redirect } from "react-router-dom";

class Complete extends Component {

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
      return <Redirect to="/Trial_TT_1" />
    }

    return (
      <div className="Complete">
        <header className="Complete-header">
        <div className="text-container">
          <p className="Complete-text">
            Congratulations
            <br /><br /> You have completed the first trial
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


// var axios = require('axios')

//      axios.post("https://btonf9vkn8.execute-api.us-east-2.amazonaws.com/DEV/service",
//      {
//         record_id: "2",
//         responses_1: "1, 1, 0, 1, 1",
//         responses_2: "0, 0, 0, 0, 0",
//         response_time_1: "1.5, 1.3, 1.2, 1.0, 1.5",
//         response_time_2: "0.5, 1, 1.5, 1, 1",
//         contrast_1: "0.5, 0.5, 0.75, 1, 1",
//         contrast_2: "0.8, 1, 0.7, 0.6, 0.5",
//         intensity_data: "{[1, 2, 3], [0.5, 0.6, 0.7], [0.5, 0.6, 0.7]}",
//         data: "{[1], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1.5, 1.3, 1.2, 1.0, 1.5], [0.5, 1, 1.5, 1, 1], [0.5, 0.5, 0.75, 1, 1], [0.8, 1, 0.7, 0.6, 0.5], {[1, 2, 3], [0.5, 0.6, 0.7], [0.5, 0.6, 0.7]}}  ",
//      }
//      ).then(function (response) {
//       console.log(response);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });

    // axios.delete("https://btonf9vkn8.execute-api.us-east-2.amazonaws.com/DEV/service", { data: {record_id: 1 }}).then(function (response) {
    //     console.log(response);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
