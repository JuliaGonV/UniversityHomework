{
    console.log("Завдання 1: перестановка значень (BACDE)");

    let a = prompt("Введіть A", 1);
    let b = prompt("Введіть B", 2);
    let c = prompt("Введіть C", 3);
    let d = prompt("Введіть D", 4);
    let e = prompt("Введіть E", 5);

    console.log("Було: ", a, b, c, d, e);

    let oldA = a, oldB = b, oldC = c, oldD = d, oldE = e;

    a = oldB;
    b = oldA;
    c = oldC;
    e = oldD;
    d = oldE;

    console.log("Стало: ", a, b, c, d, e);
}

{
    console.log("Завдання 2: периметр кола");
    let r = parseFloat(prompt("Введіть r", 1));
    let c = 2 * Math.PI * r;
    console.log(`Периметр кола = ${c} при радіусі ${r}`);
}

{
    console.log("Завдання 3: об'єднання кола та вертикальної смуги");
    let cx = parseFloat(prompt("X для кола", 0))
    let cy = parseFloat(prompt("Y для кола", 0))
    let cr = parseFloat(prompt("Радіус для кола", 1))
    let lx = parseFloat(prompt("X для вертикальної смуги", 0))

    let px = parseFloat(prompt("X для точки", 0));
    let py = parseFloat(prompt("Y для точки", 0));

    let inCircle = (px - cx) * (px - cx) + (py - cy) * (py - cy) <= cr * cr;
    let inLine = px == lx;
    let result = inCircle || inLine;

    console.log(`Точка (${px}; ${py}) ${(result ? "належить" : "не належить")} об'єднанню кола (${cx}; ${cy}) з r=${cr} та вертикальної смуги на ${lx}`);
}