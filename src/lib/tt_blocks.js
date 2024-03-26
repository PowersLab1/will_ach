import {getProcessedData} from '../store';

var _ = require('lodash');
const config = require('../config');

export function create_blocks(c25, c50, c75) {
  // Creates arrays in the form of:
  //  [0,...,0,c25,...,c25,c50,...,c50,c75,...,c75]
  // where the number of each values is passed in as an arg.
  function create_block(num_zero, num_c25, num_c50, num_c75) {
    return _.flatten([
      _.fill(Array(num_zero), 0),
      _.fill(Array(num_c25), c25),
      _.fill(Array(num_c50), c50),
      _.fill(Array(num_c75), c75)
    ]);
  }

  let blocks;
  if (config.debug) {
    blocks = [
      create_block(1,1,1,0),
      create_block(1,1,1,0),
      create_block(1,1,1,0),
      create_block(1,1,1,0),
      create_block(1,1,1,0),
      create_block(1,1,1,0),
      create_block(1,1,1,0),
      create_block(1,1,1,0),
      create_block(1,1,1,0),
      create_block(1,1,1,0),
      create_block(1,1,1,0),
      create_block(1,1,1,0),
    ];
  } else {
    blocks = [
      // First block has first 15 fixed at c75
      _.concat(_.fill(Array(8), c75), _.shuffle(create_block(1, 0, 1, 5))),
      create_block(4, 2, 2, 7),
      create_block(5, 3, 3, 4),
      create_block(6, 3, 3, 3),
      create_block(6, 4, 3, 2),
      create_block(7, 3, 3, 2),
      create_block(7, 3, 4, 1),
      create_block(7, 3, 4, 1),
      create_block(7, 3, 4, 1),
      create_block(7, 4, 3, 1),
      create_block(7, 4, 3, 1),
      create_block(7, 4, 3, 1),
    ];
  }

  // Finally, shuffle each block except for the first one
  return _.map(blocks, (block, i) => {
    if (i == 0) {
      return block;
    }
    return _.shuffle(block);
  });
}

// Keeps a singleton list of blocks so that we don't recompute each time
export function create_blocks_singleton(c25, c50, c75) {
  if (_.isUndefined(create_blocks_singleton.blocks)) {
    if (arguments.length == 3) {
      create_blocks_singleton.blocks = create_blocks(c25, c50, c75);
    } else {
      throw "Must first populate blocks singleton";
    }
  }
  return create_blocks_singleton.blocks;
}
