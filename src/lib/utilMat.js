//gets a new array using a new set of indexes (essentially orders elements)
export function subarrayIndex(arr, indices) {
    var new_array = [];

    for (var i = 0; i < indices.length; i++) {
        new_array.push(arr[indices[i]]);
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

//checks if the value is a real number or not
export function isReal(x) {
    if (!(isFinite(x)) || (isNaN(x))) {
        return false;
    }
    else { return true; }
}
