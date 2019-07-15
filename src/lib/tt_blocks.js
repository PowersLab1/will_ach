var _ = require('lodash');

export function create_blocks(c25, c50, c75) {
  // Creates arrays in the form of:
  //  [0,...,0,c25,...,c25,c50,...,c50,c75,...,c75]
  // where the number of each values is passed in as an arg.
  function create_block(num_zero, num_c25, num_c50, num_c75) {
    return _.flatten([
      _.fill(Array(num_zero, 0)),
      _.fill(Array(num_c25), c25),
      _.fill(Array(num_c50), c50),
      _.fill(Array(num_c75), c75)
    ]);
  }

  var blocks = [
    create_block(2, 1, 1, 26),
    create_block(8, 4, 4, 14),
    create_block(11, 5, 6, 8),
    create_block(12, 7, 6, 5),
    create_block(13, 7, 6, 4),
    create_block(14, 7, 6, 3),
    create_block(14, 7, 7, 2),
    create_block(14, 7, 7, 2),
    create_block(14, 7, 7, 2),
    create_block(14, 7, 7, 2),
    create_block(14, 7, 7, 2),
    create_block(14, 7, 7, 2)
  ];

  // Finally, shuffle each block before returning
  return _.map(blocks, (block) => _.shuffle(block));
}

// Keeps a singleton list of blocks so that we don't recompute each time
export function create_blocks_singleton(c25, c50, c75) {
  if (_.isUndefined(create_blocks_singleton.blocks)) {
    if (arguments.length == 3) {
      create_blocks_singleton.blocks = create_blocks(c25, c50, c75);
    }
  }
  return create_blocks_singleton.blocks;
}
