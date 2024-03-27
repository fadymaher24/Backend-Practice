"use strict";
const num1Element = document.getElementById('num1');
const num2Element = document.getElementById('num2');
const buttonElement = document.querySelector('button');
// generic type is simply a type that interacts with another type
const numResult = [];
const TextResult = [];
function add(num1, num2) {
    // type guard
    if (typeof num1 === 'number' && typeof num2 === 'number') {
        return num1 + num2;
    }
    else if (typeof num1 === 'string' && typeof num2 === 'string') {
        return num1 + '' + num2;
    }
    // convert to number
    return +num1 + +num2;
}
function printResult(resultObj) {
    console.log(resultObj.val);
}
buttonElement.addEventListener('click', () => {
    const num1 = num1Element.value;
    const num2 = num2Element.value;
    var result = add(+num1, +num2);
    numResult.push(result);
    var stringResult = add(num1, num2);
    TextResult.push(stringResult);
    printResult({ val: result, timestamp: new Date() });
    console.log(numResult, TextResult);
});
const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('It worked');
    }, 1000);
});
myPromise.then(result => {
    console.log(result.split('w'));
});
