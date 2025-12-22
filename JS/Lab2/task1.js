import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

const calculateVerticalPoints = () => {
    const [verticalX, verticalY1, verticalY2] = [0, -1, 1];

    const verticalPoints = [];
    for (let y = verticalY1; y <= verticalY2; y++) {
        verticalPoints.push([verticalX, y]);
    }
    return verticalPoints;
};

const calculateHorizontalPoints = () => {
    const [horizontalY, horizontalX1, horizontalX2] = [0, -1, 1];

    const horizontalPoints = [];
    for (let x = horizontalX1; x <= horizontalX2; x++) {
        horizontalPoints.push([x, horizontalY]);
    }
    return horizontalPoints;
};

const unionPoints = (a, b) => {
    const set = new Set([...a, ...b].map(p => `${p[0]},${p[1]}`));
    return [...set].map(s => s.split(',').map(Number));
};

const intersectPoints = (a, b) => {
    const setB = new Set(b.map(p => `${p[0]},${p[1]}`));
    return a.filter(p => setB.has(`${p[0]},${p[1]}`));
};

const calculateUnionPoints = () => {
    return unionPoints(
        calculateVerticalPoints(),
        calculateHorizontalPoints()
    );
};

const calculateCirclePoints = () => {
    const [circleCenterX, circleCenterY, circleRadius] = [0, 0, 1];

    const circlePoints = [];
    for (let y = circleCenterY - circleRadius; y <= circleCenterY + circleRadius; y++) {
        for (let x = circleCenterX - circleRadius; x <= circleCenterX + circleRadius; x++) {
            if ((x - circleCenterX) ** 2 + (y - circleCenterY) ** 2 <= circleRadius ** 2) {
                circlePoints.push([x, y]);
            }
        }
    }
    return circlePoints;
};

const calculateAllPoints = () => {
    return intersectPoints(
        calculateUnionPoints(),
        calculateCirclePoints()
    );
};

const correctPoints = calculateAllPoints();
const maxAttempts = 5;

console.log(`У вас ${maxAttempts} спроб.`);

const hit = (x, y) => {
    let minDistance = Number.MAX_SAFE_INTEGER

    for (let i = 0; i < correctPoints.length; i++) {
        let point = correctPoints[i]

        if (point[0] === x && point[1] === y) {
            return [true];
        }

        let distance = Math.sqrt((point[0] - x) ** 2 + (point[1] - y) ** 2)
        minDistance = Math.min(minDistance, distance)
    }

    return [false, minDistance];
}

let lastDistance = Number.MAX_SAFE_INTEGER

const try_win = async (attempt) => {
    let x = NaN;
    let y = NaN;

    do {
        const line = await rl.question(`Спроба ${attempt + 1}. Уведіть "x, y": `);
        [x, y] = line.trim().split(/,\s*/).map(Number);

        if (isNaN(x) || isNaN(y)) {
            console.log("Введіть 2 координати у вигляді \"x, y\"!");
        }
    } while (isNaN(x) || isNaN(y))

    let hitResult = hit(x, y)
    if (hitResult[0]) {
        console.log(`Пряме влучання!`);
        rl.close();

        return true;
    }

    let clue = hitResult[1] < lastDistance ? "Тепліше" : "Холодніше"
    lastDistance = hitResult[1]

    console.log(`Промах. ${clue}`);
};

const play = async () => {
    for (let i = 0; i < maxAttempts; i++) {
        if (await try_win(i)) {
            return;
        }
    }

    console.log("Гру закінчено...");
}
    
await play()
rl.close();