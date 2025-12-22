const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Введіть послідовність цілих чисел через пробіл:");

function getMinDigit(n) {
    n = Math.abs(n);
    if (n === 0) return 0;

    let min = 9;
    while (n > 0) {
        const digit = n % 10;
        
        if (digit < min) {
            min = digit;  
        } 

        n = Math.floor(n / 10);
    }

    return min;
}

function sort(arr, indices) {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - 1 - i; j++) {
            const a = arr[indices[j]];
            const b = arr[indices[j + 1]];

            const critA = getMinDigit(a);
            const critB = getMinDigit(b);

            if (critA > critB) {
                const temp = indices[j];
                indices[j] = indices[j + 1];
                indices[j + 1] = temp;
            }
        }
    }
}

rl.on('line', (line) => {
    const arr = line.trim().split(/\s+/).map(Number).filter(n => Number.isInteger(n));
    
    if (!arr.length) {
        return rl.close();
    }

    let indices = [];
    for (let i = 0; i < arr.length; i++) {
        indices.push(i);
    }

    sort(arr, indices)
    console.log(`Упорядковані індекси: ${indices.join(' ')}`);

    rl.close();
});
