export function create_blocks(c25, c50, c75){
  var tt1 = shuffle([0,0, c25, c50, c75, c75, c75, c75, c75, c75, c75, c75, c75, c75, c75, c75, c75, c75, c75, c75 ,c75, c75, c75, c75, c75, c75, c75, c75, c75, c75]);
  var tt2 = shuffle([0, 0, 0, 0, 0, 0, 0, 0, c25, c25, c25, c25, c50, c50, c50, c50, c75, c75, c75, c75 ,c75, c75, c75, c75, c75, c75, c75, c75, c75, c75]);
  var tt3 = shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, c25, c25, c25, c25, c25, c50, c50, c50, c50, c50, c50, c75, c75 ,c75, c75, c75, c75, c75, c75]);
  var tt4 = shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, c25, c25, c25, c25, c25, c25, c25, c50, c50, c50, c50, c50, c50, c75, c75 ,c75, c75, c75]);
  var tt5 = shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, c25, c25, c25, c25, c25, c25, c25, c50, c50, c50, c50, c50, c50, c75, c75 ,c75, c75]);
  var tt6 = shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, c25, c25, c25, c25, c25, c25, c25, c50, c50, c50, c50, c50, c50, c75, c75 ,c75]);
  var tt7 = shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, c25, c25, c25, c25, c25, c25, c25, c50, c50, c50, c50, c50, c50, c50, c75 ,c75]);
  var tt8 = shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, c25, c25, c25, c25, c25, c25, c25, c50, c50, c50, c50, c50, c50, c50, c75 ,c75]);
  var tt9 = shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, c25, c25, c25, c25, c25, c25, c25, c50, c50, c50, c50, c50, c50, c50, c75 ,c75]);
  var tt10 = shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, c25, c25, c25, c25, c25, c25, c25, c50, c50, c50, c50, c50, c50, c50, c75 ,c75]);
  var tt11 = shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, c25, c25, c25, c25, c25, c25, c25, c50, c50, c50, c50, c50, c50, c50, c75 ,c75]);
  var tt12 = shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, c25, c25, c25, c25, c25, c25, c25, c50, c50, c50, c50, c50, c50, c50, c75 ,c75]);
  var blocks = [tt1,tt2,tt3,tt4,tt5,tt6,tt7,tt8,tt9,tt10,tt11,tt12];
  // blocks.push = tt1;
  // blocks.push = tt2;
  // blocks.push = tt3;
  // blocks.push = tt4;
  // blocks.push = tt5;
  // blocks.push = tt6;
  // blocks.push = tt7;

  return blocks;
}

function shuffle (array) {
  var i = 0
  var j = 0
  var temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
    }
    return array;
  }
