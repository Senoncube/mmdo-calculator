class IntegerMethod {
    constructor(table) {
        this.table = table;
        this.x_cut = null;
    }

    calculateCutOff() {
        let n = this.table.arr.length - 2, m = this.table.arr[0].length - 2;
        let new_x = `x${this.table.arr[0].length - 2}`;


        let new_row = [new GreatNumber(0, 0), new_x];
        for (let j = 2; j < m + 2; j++) {
            new_row.push(new Frac(0, 1).sub(this.table.arr[this.x_cut][j].sub(Math.floor(this.table.arr[this.x_cut][j]))));
        }

        new_row.push(new Frac(1, 1));

        let new_col = [new GreatNumber(0, 0), new_x, ...new Array(m).fill(new Frac(0, 1))];

        let new_arr = AdditionalFunctions.copy_arr(this.table.arr).slice(0, n + 1);
        for (let i = 0; i < n + 1; i++)
            new_arr[i].push(new_col[i]);

        new_arr.push(new_row);
        new_arr.push(["", "Δ", ...new Array(m + 1).fill(0)]);

        //console.log(AdditionalFunctions.copy_arr(new_arr), this.table.x_n);

        return {
            simplexTable: new DualSimplexArr(new_arr, this.table.x_n),
            newRestrictionHTML: this.restrictionHTML(n, m, new_x)
        };
    }

    restrictionHTML(n, m, new_x) {
        let newRestrictionHTML = "<div>Розв'язок не є цілочисельним, додаємо правильне відсічення:</div>";
        let newRestriction = [];

        for (let j = 2; j < m + 2; j++) {
            let x = this.table.arr[this.x_cut][j], round_x = Math.floor(this.table.arr[this.x_cut][j]);
            newRestriction.push(new Frac(0, 1).sub(x.sub(round_x)));
        }

        newRestriction.push(new Frac(1, 1));
        let coef = newRestriction.shift();



        let vars = this.table.arr[1].slice(3);
        vars.push(new_x);
        vars = IntegerMethod.#varsToHTML(vars);

        newRestrictionHTML += `<div class=\"equations\">${IntegerMethod.genEq(vars, newRestriction, coef, "=")}</div>`;
        return newRestrictionHTML;
    }

    checkIsResult() {

        for (let j = 3; j < this.table.x_n + 3; j++) {
            //console.log(this.table.arr[1][j]);
            for (let i = 2; i < this.table.arr.length - 1; i++) {
                //console.log(` ${this.table.arr[i][1]}`);
                if (this.table.arr[1][j] === this.table.arr[i][1]) {
                    let t = this.table.arr[i][2];
                    if (t.b !== 1) {
                        this.x_cut = i;
                        return false;
                    }

                }
            }

        }

        return true;
    }

    static #varsToHTML(vars) {
        let res = [];
        for (let i = 0; i < vars.length; i++)
            res.push(`x<sub>${vars[i].substr(1)}</sub>`);
        return res;
    }

    static genEq(vars, coefs, freeCoef, sign) {
        let eq = IntegerMethod.#coefsToString(coefs, vars);
        if (!eq)
            eq = "0";
        eq += ` ${sign} ${freeCoef}`;
        return `<div class='equation'>${eq}</div>`;
    }

    static #coefsToString(coefs, vars) {
        let res = "";
        for (let i = 0; i < coefs.length; i++) {
            if (coefs[i] == 1)
                res += ` + ${vars[i]}`;
            else if (coefs[i] == -1)
                res += ` - ${vars[i]}`;
            else if (coefs[i] < 0)
                if (coefs[i] instanceof Frac)
                    if (res === "")
                        res += ` + ${coefs[i]}${vars[i]}`;
                    else
                        res += ` - ${coefs[i].abs()}${vars[i]}`;
                else
                    res += ` - ${Math.abs(coefs[i])}${vars[i]}`;
            else if (coefs[i] > 0)
                res += ` + ${coefs[i]}${vars[i]}`;
        }

        if (res[1] === "-") {
            res = res.substr(3);
            res = "-" + res;
            return res;
        }
        return res.substr(3);
    }
}



class DualSimplexArr extends SimplexArr{
    constructor(...arr) {
        super(...arr);
        this.theta_arr = null;
    }
    calcPivotElement() {
        let min_j = null, min_i_val = this.arr[2][2], min_i = 2;

        for (let i = 2; i < this._n + 1; i++)
            if (min_i_val > this.arr[i][2])
                min_i_val = this.arr[i][2];

        if (min_i_val >= 0)
            return;

        for (min_i = 2; min_i < this._n + 1; min_i++) {
            if (this.arr[min_i][2] === min_i_val) {
                this.q = {
                    arr_str: [],
                    arr: [],
                    element: null
                }
                this.theta_arr = ["", "θ", "-"];

                for (let j = 3; j < this._m + 2; j++)
                    if (this.arr[min_i][j] < 0) {
                        if (min_j === null)
                            min_j = j;
                        else
                        if (this.arr[this._n + 1][j].div( this.arr[min_i][j]).abs() < this.arr[this._n + 1][min_j].div(this.arr[min_i][min_j]).abs())
                            min_j = j;
                        this.theta_arr.push(this.arr[this._n + 1][j].div(this.arr[min_i][j]).abs());
                    }
                    else
                        this.theta_arr.push("-");
            }

            if (min_j !== null) {
                break;
            }

            if (min_i === (this._n)) {
                this._fl = true;
                return;
            }

        }

        this.pivotElement = {
            i: min_i,
            j: min_j
        };
    }

    next() {
        if (!this.checkIsNextPossible())
            return null;
        return new DualSimplexArr(this._calcNextArr().slice(0, this._n + 2), this.x_n);
    }
}