const num1Element = document.getElementById('num1') as HTMLInputElement;
const num2Element = document.getElementById('num2') as HTMLInputElement;
const buttonElement = document.querySelector('button')!;

const numResult: number[] = [];
const TextResult: string[] = [];

function add(num1: number | string,num2: number | string){
    // type guard
    if(typeof num1 === 'number' && typeof num2 === 'number'){
    return num1+num2;
    }else if(typeof num1 === 'string' && typeof num2 === 'string'){
    return num1+''+num2;
    }
    // convert to number
    return +num1 + +num2;
}

function printResult(resultObj : {val: number, timestamp: Date}){
    console.log(resultObj.val);
}

buttonElement.addEventListener('click', () =>{
    const num1 = num1Element.value;
    const num2 = num2Element.value;
    var result = add(+num1, +num2);
    numResult.push(result as number);
    var stringResult = add(num1, num2);
    TextResult.push(stringResult as string);
    printResult({val: result as number, timestamp: new Date()});
    console.log(numResult , TextResult);
});