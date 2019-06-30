//gets a new array using a new set of indexes (essentially orders elements)
export function subarrayIndex(arr, indices) {
    var new_array = []

    for (var i = 0; i < indices.length; i++) {
        new_array.push(arr[indices[i]]);
    }

    return new_array;
}

//returns an array with non-zero elements from the original
export function findZero(arr) {
    var new_array = []

    for (var i = 0; i < arr.length; i++) {
        if (arr[i] > 0) {
            new_array.push(i);
        };
    }

    return new_array;
}

//equivalent to the diff function in matlab
export function diff(arr) {
    var new_array = []

    for (var i = 0; i < arr.length - 1; i++) {
        new_array.push(arr[i + 1] - arr[i]);
    }

    return new_array;
}

//this is a cumulative summation of an array 
export function cumsum(arr) {
    var new_array = [];
    arr.reduce(function (a, b, i) { return new_array[i] = a + b; }, 0);
    return new_array;
}

//this multiplies the elements in a vector/array
export function multiplyVector(a, b) {
    return a.map((e, i) => e * b[i]);
}

//this sums the elements in a vector/array
export function sumVector(v) {
    return v.reduce((a, b) => a + b, 0);
}

//gets the index of the max value of an array (matlab does this automatically with the max function)
export function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

//checks if the value is a real number or not
export function isReal(x) {
    if (!(isFinite(x)) || (isNaN(x))) {
        return false;
    }
    else { return true; }
}

//array shuffling function, used to randomize order of presentation for different blocks
export function shuffle(array) {
    var i = 0
    var j = 0
    var temp = null

    for (i = array.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1))
        temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}
