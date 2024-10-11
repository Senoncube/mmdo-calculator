function simplexSolve(simplexTable) {
    SimplexVisual.table_i = 1;
    let solve = document.querySelector("#solve"), i = 1;
    solve.innerHTML = "";
    simplexTable.arr = refactorArr(simplexTable.arr);

    simplexTable = simplexLoop(simplexTable, solve);
    solve.innerHTML += new SimplexVisual(simplexTable).resultsToHTML();

    if (simplexTable.checkResult() !== true)
        return;

    let integerTask = new IntegerMethod(simplexTable);
    //console.log(integerTask, integerTask.checkIsResult());

    let int_i = 0;
    while (!integerTask.checkIsResult()) {
        let newRestrictionHTML = "";
        ({simplexTable, newRestrictionHTML} = integerTask.calculateCutOff());
        solve.innerHTML += newRestrictionHTML;

        simplexTable = simplexLoop(simplexTable, solve);

        //console.log(simplexTable);

        solve.innerHTML += new SimplexVisual(simplexTable).resultsToHTML();

        integerTask = new IntegerMethod(simplexTable);

        if (i++ > 20) {
            alert("Правильних відсічень більше 20, неможливо знайти оптимальний цілочисельний розв'язок!!!");
            return;
        }

    }

    if (simplexTable.checkResult() === true)
        solve.innerHTML += "<div style='font-size: 25px; font-weight: bold;'>Отримано оптимальний цілочисельний розв'язок задачі!</div>";
}

function simplexLoop(simplexTable, solve) {
    while (true) {
        simplexTable.calcDelta();
        simplexTable.calcPivotElement();

        let simplexVisual = new SimplexVisual(simplexTable);
        solve.innerHTML += simplexVisual.tableToHTML();

        if (!simplexTable.checkIsNextPossible())
            break;
        else
            simplexTable = simplexTable.next();
    }
    return simplexTable;
}

class SimplexArr {
    _n;
    _m;
    _fl = false;
    constructor(arr, x_n) {
        this.arr = arr;
        this.x_n = x_n;
        this.pivotElement = null;


        this._n = this.arr.length - 2;
        this._m = this.arr[0].length - 2;
    }

    calcDelta() {
        for (let j = 2; j < this._m + 2; j++) {
            if (j !== 2)
                this.arr[this._n + 1][j] = this.arr[0][j].mul(-1);
            else
                this.arr[this._n + 1][j] = new GreatNumber(0, 0);

            for (let i = 2; i < this._n + 1; i++)
                this.arr[this._n + 1][j] = this.arr[this._n + 1][j].add(this.arr[i][0].mul( this.arr[i][j]));
        }
    }

    calcPivotElement() {

        let min_j, min_delta, min_i = null;

        min_delta = Math.min(...this.arr[this._n + 1].slice(3));
        if (min_delta >= 0)
            return;

        for (min_j = 2; min_j < this._m + 2; min_j++) {
            if (+this.arr[this._n + 1][min_j] === min_delta) {

                for (let i = 2; i < this._n + 1; i++)
                    if (this.arr[i][min_j] > 0) {
                        if (min_i === null)
                            min_i = i;
                        else
                        if (this.arr[i][2].div(this.arr[i][min_j]) < this.arr[min_i][2].div(this.arr[min_i][min_j]))
                            min_i = i;

                    }

            }

            if (min_i !== null) {
                break;
            }
            if (min_j === (this._m + 1)) {
                this._fl = true;
                return;
            }

        }

        this.pivotElement = {
            i: min_i,
            j: min_j
        };
    }

    checkIsNextPossible() {
        return this.pivotElement !== null;
    }

    checkResult() {
        if (this.pivotElement !== null)
            return "Задача має продовження";
        if (this._fl)
            return "Всі Δ ≥ 0 і в напрямному стовпці всі значення ≤ 0, тому задача рішення не має";
        for (let i = 2; i < this._n + 1; i++)
            if (this.arr[i][2] < 0)
                return "Всі Δ ≥ 0 і в стовпці вільних коефіцієнтів є відємне значення, тому задача рішення не має";
            else if (this.arr[i][0].m != 0)
                return "Всі Δ ≥ 0 і в базисі все ще є штучна змінна, тому задача рішення не має"
        return true;
    }

    next() {
        if (!this.checkIsNextPossible())
            return null;
        return new SimplexArr(this._calcNextArr(), this.x_n);
    }

    _calcNextArr() {


        let new_arr = AdditionalFunctions.copy_arr(this.arr);

        new_arr[this.pivotElement.i][0] = this.arr[0][this.pivotElement.j];
        new_arr[this.pivotElement.i][1] = this.arr[1][this.pivotElement.j];

        for (let i = 2; i < this._n + 1; i++) {
            for (let j = 2; j < this._m + 2; j++)
                if (i === this.pivotElement.i)
                    new_arr[i][j] = this.arr[this.pivotElement.i][j].div(this.arr[this.pivotElement.i][this.pivotElement.j]);
                else
                    new_arr[i][j] = this.arr[i][j].sub(
                        (this.arr[this.pivotElement.i][j].mul(this.arr[i][this.pivotElement.j]).div(
                            this.arr[this.pivotElement.i][this.pivotElement.j])));
            new_arr[i][this.pivotElement.j] = new Frac(0, 1);
        }
        new_arr[this.pivotElement.i][this.pivotElement.j] = new Frac(1, 1);

        if (this.arr[this.pivotElement.i][0].m != 0) {
            //console.log(this.arr[this.pivotElement.i][0].m)
            for (let j = 3; j < this._m + 2; j++) {
                if (this.arr[this.pivotElement.i][1] === this.arr[1][j]) {
                    new_arr = AdditionalFunctions.delete_row(new_arr, j);
                    break;
                }
            }
        }

        return new_arr;
    }
}

class SimplexVisual {
    _fontSize;
    static table_i = 1;
    constructor(table) {
        //console.log(table);
        this.table = table;
        this._fontSize = 20;
    }

    tableToHTML() {
        if (this.table.theta_arr !== undefined)
            return SimplexVisual.#tableToStr(this.table.arr, this.table.pivotElement, this.table.theta_arr);
        else
            return SimplexVisual.#tableToStr(this.table.arr, this.table.pivotElement, null)
    }

    static #tableToStr(arr, pivotElement, theta) {
        console.log(pivotElement);
        arr = AdditionalFunctions.copy_arr(arr);
        arr[0][2] = "-";
        if (!!theta)
            arr.push(theta);

        let table = "";

        for (let j = 2; j < arr[0].length; j++)
            arr[1][j] = SimplexVisual.#getSmall(`A${arr[1][j].substring(1)}`);
        for (let i = 2; i < arr.length - 1; i++)
            arr[i][1] = SimplexVisual.#getSmall(arr[i][1]);

        for (let i = 0; i < arr.length; i++) {
            let tr = "<tr>";
            if (!!pivotElement && i === pivotElement.i)
                tr = "<tr class='mark'>";
            if (!!theta && i === arr.length - 1)
                tr = "<tr class='theta-row'>"
            for (let j = 0; j < arr[0].length; j++) {
                if (!!pivotElement && j === pivotElement.j)
                    tr += `<td class="mark">${arr[i][j]}</td>`;
                else
                    tr += `<td>${arr[i][j]}</td>`;
            }

            table += tr + "</tr>";
        }

        let s = `<div class="right">Таблиця ${SimplexVisual.table_i++}</div>`;
        return `<div class="simplex-wrapper">${s + `<table class='simplex_table'> ${table} </table>`}</div>`;
    }

    resultsToHTML() {
        //console.log(this);
        let func_res = "", func_res_int = new Frac(0, 1);

        let res = this.table.checkResult();
        if (res !== true) {
            return `<div class="res"><h4 style='color: red'>${res}</h4></div>`;
        }

        let result = "<div>Всі дельта більше нуля, отримано оптимальний розв’язок задачі:</div>"


        let x_results = "";
        for (let j = 3; j < this.table.x_n + 3; j++) {
            //console.log(this.table.arr[1][j]);
            let fl = false;
            for (let i = 2; i <  this.table.arr.length - 1; i++) {
                //console.log(` ${this.table.arr[i][1]}`);
                if (this.table.arr[i][1] === this.table.arr[1][j]) {
                    let t = this.table.arr[i][2];
                    x_results += `, ${SimplexVisual.#getSmall(this.table.arr[i][1])} = ${t}`;
                    func_res += ` + ${this.table.arr[i][0]} * ${t}`;
                    //func_res_int = func_res_int.add(this.table.arr[i][0].mul(t));
                    fl = true;
                }
            }

            if (j - 3 < this.table.x_n && !fl) {
                x_results += `, ${SimplexVisual.#getSmall(this.table.arr[1][j])} = 0`;
                func_res += ` + ${this.table.arr[0][j]} * 0`;
            }


        }
        result += `<div class='x_results'>${x_results.substring(2)}</div>`;

        result += `<div class="func_res">F<sub>max</sub> = ${func_res.substr(3)} = ${this.table.arr[this.table.arr.length - 1][2]}</div>`;

        return `<div class="res">${result}</div>`;
    }

    static #getSmall(s) {
        return s[0] + "<sub>" + s.substr(1) + "</sub>";
    }
}

function refactorArr(arr) {
    let new_arr = AdditionalFunctions.copy_arr(arr);
    for (let i = 0; i < arr.length; i++)
        for (let j = 0; j < arr[0].length; j++)
            if (typeof arr[i][j] === typeof 1) {
                if (i !== 0 && j !== 0 && i !== (arr.length - 1))
                    new_arr[i][j] = new Frac(arr[i][j], 1);
                else
                    new_arr[i][j] = new GreatNumber(0, arr[i][j]);
            }

    return new_arr;
}
