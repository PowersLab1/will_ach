import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {createStim, createGabor} from "../lib/Stim.js";

var _ = require('lodash');
var SimplexNoise = require('simplex-noise');

const IMG_SRC = "https://raw.githubusercontent.com/PowersLab1/VCH_APP_SMITH/master/src/media/fix_cross.png";
const RATINGS_SRC = "https://raw.githubusercontent.com/PowersLab1/VCH_APP_SMITH/master/src/media/rating_scale.png";

class VisualStimulus extends Component {
  constructor(props) {
    super(props);
    this.showContrast = false;
    this.showRatings = false;
    this.contrast = 0;
  }

  startAnimation() {
    var simplex = new SimplexNoise(),
      canvas = document.getElementById('c'),
      ctx = canvas.getContext('2d'),
      imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height),
      data = imgdata.data,
      t = 0; // t is used to generate noise over time

    var stim = createStim();
    var stimulus_blank = createGabor(stim, 0);
    var stimulus = undefined;
    var that = this;

    function nextFrame() {
      for (var x = 0; x < 256; x++) {
        for (var y = 0; y < 256; y++) {
          if (that.props.showContrast && that.props.contrast !== 0) {
            // Populate stimulus data if we don't have it already
            if (_.isUndefined(stimulus)) {
              // If the gabor layer has been precomputed for us, th
              if (that.props.precomputedGabor) {
                stimulus = that.props.precomputedGabor;
              } else {
                // Otherwise, we create it ourselves
                stimulus = createGabor(stim, that.props.contrast);
              }
            }

            const r = simplex.noise3D(x / 8, y / 8, t / 8) * 0.4 + 0.35;
            data[(x + y * 256) * 4 + 0] = stim.alpha * stimulus[(x + y * 256) * 4 + 0] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 1] = stim.alpha * stimulus[(x + y * 256) * 4 + 1] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 2] = stim.alpha * stimulus[(x + y * 256) * 4 + 2] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 3] = 255;
          } else {
            // Technically we only need reset this once, but it's relatively inexpensive
            // and convenient so we do it here.
            stimulus = undefined;

            const r = simplex.noise3D(x / 8, y / 8, t / 8) * 0.4 + 0.35;
            data[(x + y * 256) * 4 + 0] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 0] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 1] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 1] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 2] = stim.alpha * stimulus_blank[(x + y * 256) * 4 + 2] + (1 - stim.alpha) * r * 250;
            data[(x + y * 256) * 4 + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgdata, 0, 0);

      const img = new Image();
      let rectWidth, rectHeight;

      if (that.props.showRatings) {
        img.src = RATINGS_SRC;
        rectWidth = canvas.width;
        rectHeight = canvas.height;
        ctx.fillStyle = "white";
      } else {
        img.src = IMG_SRC;
        rectWidth = canvas.width / 8;
        rectHeight = canvas.height / 8;
      }

      ctx.fillStyle = "gray";

      var xPos = (canvas.width / 2) - (rectWidth / 2);
      var yPos = (canvas.height / 2) - (rectHeight / 2);

      ctx.fillRect(xPos, yPos, rectWidth, rectHeight);
      ctx.drawImage(img, xPos, yPos, rectWidth, rectHeight);

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

/*
  componentWillReceiveProps(props) {
    console.log(props);
  }
*/

  render() {
    return (
        <canvas id="c" width="256" height="256"
          style={{ zIndex:"0", position: "fixed", left: "25%",width: '50%', height:'auto'}}></canvas>
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
