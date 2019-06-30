import React, { Component } from 'react';
import './Complete.css';
import { connect } from 'react-redux'
import { Redirect } from "react-router-dom";

class Complete extends Component {

  constructor(props) {
    super(props);
    this.keyFunction = this.keyFunction.bind(this);
    this.state = {
      continue: false,
    }
  }

  keyFunction(event) {
    if (event.keyCode === 81) {
      alert("User has Requested to Continue");
      this.setState((state, props) => ({
        continue: true
      }));
    }
  }

  componentDidMount() {
    var axios = require('axios')

    axios.post("https://btonf9vkn8.execute-api.us-east-2.amazonaws.com/DEV/service",
      {
        record_id: "2",
        responses_1: "1, 1, 0, 1, 1",
        responses_2: "0, 0, 0, 0, 0",
        response_time_1: "1.5, 1.3, 1.2, 1.0, 1.5",
        response_time_2: "0.5, 1, 1.5, 1, 1",
        contrast_1: "0.5, 0.5, 0.75, 1, 1",
        contrast_2: "0.8, 1, 0.7, 0.6, 0.5",
        intensity_data: "{[1, 2, 3], [0.5, 0.6, 0.7], [0.5, 0.6, 0.7]}",
        data: "{[1], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1.5, 1.3, 1.2, 1.0, 1.5], [0.5, 1, 1.5, 1, 1], [0.5, 0.5, 0.75, 1, 1], [0.8, 1, 0.7, 0.6, 0.5], {[1, 2, 3], [0.5, 0.6, 0.7], [0.5, 0.6, 0.7]}}  ",
      }
    ).then(function (response) {
      console.log(response);
    })
      .catch(function (error) {
        console.log(error);
      });

    axios.delete("https://btonf9vkn8.execute-api.us-east-2.amazonaws.com/DEV/service", { data: { record_id: 1 } }).then(function (response) {
      console.log(response);
    })
      .catch(function (error) {
        console.log(error);
      });
    document.addEventListener("keydown", this.keyFunction, false);

  }
  componentWillUnmount() {
    //document.removeEventListener("keydown", this.keyFunction, false);
  }


  render() {
    console.log(this.props.data);

    // if (this.state.continue === true) {
    //   return <Redirect to="/Trial_TT_1" />
    // }

    return (
      <div className="Complete">
        <header className="Complete-header">
          <div className="text-container">
            <p className="Complete-text">
              Congratulations
                <br /><br /> You have completed the first trial
                <br /><br /> You responses have been recorded:
                <br /><br />
              Responses:
                {this.props.data.responses_q_1.map(function (d, idx) {
                return (<li key={idx} style={{ listStyleType: "none" }}>{d}</li>)
              })}
              Response Times:
                {this.props.data.response_time_q_1.map(function (d, idx) {
                return (<li key={idx} style={{ listStyleType: "none" }}>{d}</li>)
              })}
              Contrasts:
                {this.props.data.contrast_q_1.map(function (d, idx) {
                return (<li key={idx} style={{ listStyleType: "none" }}>{d}</li>)
              })}
              Intensities:
                {this.props.data.trial1Struct.intensities.map(function (d, idx) {
                return (<li key={idx} style={{ listStyleType: "none" }}>{d}</li>)
              })}
              <br /><br />
            </p>
          </div>
        </header>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  data: state.data,
})

export default connect(mapStateToProps)(Complete)


