import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {stim, patch, stimulus_blank, createGabor} from "../lib/Stim.js";
import RATINGS_SRC from "../media/rating_scale.png";
import RATINGS_1_SRC from "../media/rating_1.png";
import RATINGS_2_SRC from "../media/rating_2.png";
import RATINGS_3_SRC from "../media/rating_3.png";
import RATINGS_4_SRC from "../media/rating_4.png";
import RATINGS_5_SRC from "../media/rating_5.png";
import './Trial.css';

var _ = require('lodash');
var SimplexNoise = require('simplex-noise');

const IMG_SRC = "https://raw.githubusercontent.com/PowersLab1/VCH_APP_SMITH/master/src/media/fix_cross.png";
const CANVAS_LENGTH = 320;

class VisualStimulus extends Component {
  constructor(props) {
    super(props);
    this.animationFrameId = undefined;
  }

  startAnimation() {
    var simplex = new SimplexNoise(),
      canvas = document.getElementById('c'),
      ctx = canvas.getContext('2d'),
      imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height),
      data = imgdata.data,
      t = 0; // t is used to generate noise over time


    var stimulus = undefined;
    var stimulusWithAlpha = undefined;
    var that = this;
    var c = stim.alpha * stimulus_blank[0];

    function nextFrame() {
      for (var x = 0; x < CANVAS_LENGTH; x++) {
        for (var y = 0; y < CANVAS_LENGTH; y++) {
          if (that.props.showContrast && that.props.contrast !== 0) {
            // Populate stimulus data if we don't have it already
            if (_.isUndefined(stimulus)) {
              // If the gabor layer has been precomputed for us, th
              if (that.props.precomputedGabor) {
                stimulus = that.props.precomputedGabor;
              } else {
                // Otherwise, we create it ourselves
                stimulus = createGabor(patch, that.props.contrast);
              }
            }

            const r = simplex.noise3D(x / 8, y / 8, t/5) * .8  + 0.65;

            data[(x + y * CANVAS_LENGTH) * 4 + 0] = stim.alpha * stimulus[(x + y * CANVAS_LENGTH) * 4 + 0] + (1 - stim.alpha) * r * 250;
            data[(x + y * CANVAS_LENGTH) * 4 + 1] = stim.alpha * stimulus[(x + y * CANVAS_LENGTH) * 4 + 1] + (1 - stim.alpha) * r * 250;
            data[(x + y * CANVAS_LENGTH) * 4 + 2] = stim.alpha * stimulus[(x + y * CANVAS_LENGTH) * 4 + 2] + (1 - stim.alpha) * r * 250;
            data[(x + y * CANVAS_LENGTH) * 4 + 3] = 255;
          } else {
            // Technically we only need reset this once, but it's relatively inexpensive
            // and convenient so we do it here.
            stimulus = undefined;

            const r = simplex.noise3D(x / 8, y / 8, t/5) * .8  + 0.65;

            const val = c + (1 - stim.alpha) * r * 250;
            data[(x + y * CANVAS_LENGTH) * 4 + 0] = val;
            data[(x + y * CANVAS_LENGTH) * 4 + 1] = val;
            data[(x + y * CANVAS_LENGTH) * 4 + 2] = val;
            data[(x + y * CANVAS_LENGTH) * 4 + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgdata, 0, 0);

      const rectWidth = canvas.width / 8;
      const rectHeight = canvas.height / 8;
      ctx.fillStyle = "gray";

      var xPos = (canvas.width / 2) - (rectWidth / 2);
      var yPos = (canvas.height / 2) - (rectHeight / 2);

      ctx.fillRect(xPos, yPos, rectWidth, rectHeight);

      // Render next frame
      that.animationFrameId = window.requestAnimationFrame(nextFrame);

      // Bump t to generate shifting noise
      t = (t + 1) % (1 << 31);
    }
    nextFrame();
  }

  componentDidMount() {
    this.startAnimation();
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.animationFrameId);
  }

  render() {
    return (
      <div>
        <img src={RATINGS_SRC} width={CANVAS_LENGTH} height={CANVAS_LENGTH} class="center"
        style={
          {
            zIndex: 101,
            width: '80vh',
            height: '40vh',
            backgroundColor: "#9e9e9e",
            visibility: this.props.showRatings ? 'visible' : 'hidden',
          }
         }
        />
        <div style={
          {
            zIndex: 100,
            backgroundColor: "#9e9e9e",
            width: "100%",
            height: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            visibility: this.props.showRatings ? 'visible' : 'hidden',
          }
         }
        ></div>
        <canvas id="c" width={CANVAS_LENGTH} height={CANVAS_LENGTH} class="center clip-circle blur blurred-edge"
          style={
            {
              zIndex:1,
              width: '85vh',
              height: '85vh',
            }
          }></canvas>
        <div class="center circle blurred-edge" style={{zIndex: 3}}></div>
        <div class="center cross-1" style={{zIndex: 10}}></div>
        <div class="center cross-2" style={{zIndex: 10}}></div>
        <div class="center radial-gradient"
          style={
            {
              zIndex: 20,
              width: '85vh',
              height: '85vh',
            }}></div>

      </div>
    );
  } // end render
} // end class


VisualStimulus.defaultProps = {
  showContrast: false,
  showRatings: false,
  contrast: 0,
  precomputedGabor: undefined,
}

VisualStimulus.propTypes = {
  showContrast: PropTypes.bool.isRequired,
  showRatings: PropTypes.bool,
  contast: PropTypes.number,
  precomputedGabor: PropTypes.array,
}

export default VisualStimulus;
