const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Введіть послідовність цілих чисел через пробіл:");

function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    for (let i = 3; i * i <= n; i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

rl.on('line', (line) => {
    let index = 0;
    let maxPrime = null;
    let maxPrimeIndex = -1;

    const numbers = line.trim().split(/\s+/).map(Number);

    for (let index = 0; index < numbers.length; index++) {
        let number = numbers[index];
        
        if (!Number.isInteger(number)) {
            continue;
        }

        if (!isPrime(number)) {
            continue;
        }

        if (maxPrime === null || number >= maxPrime) {
            maxPrime = number;
            maxPrimeIndex = index; 
        }
    }

    if (maxPrimeIndex !== -1) {
        console.log(`Найбільше просте число: ${maxPrime}`);
        console.log(`Індекс останнього найбільшого простого числа: ${maxPrimeIndex}`);
    } else {
        console.log("Прості числа у послідовності відсутні.");
    }

    rl.close();
});