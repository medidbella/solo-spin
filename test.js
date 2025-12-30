Array.prototype.last = function() {
    const len = this.length;

    return this.at(len - 1);
};

arr1 = [1 , [1, 2 , 3], [3, 3, 4] , [8, 8]];
console.log(arr1.last());