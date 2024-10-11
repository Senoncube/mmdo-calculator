class Frac {
    constructor(a, b) {
        this.a = a;
        this.b = b;

        if (a < 0 && b < 0) {
            this.a = Math.abs(a);
            this.b = Math.abs(b);
        }
        else if (b < 0) {
            this.a = -a;
            this.b = Math.abs(b);
        }

        let t = Frac.#gcd(this.a, this.b);
        this.a /= t;
        this.b /= t;
    }

    add(other) {
        other = Frac.convertOther(other);
        return new Frac(this.a * other.b + other.a * this.b, this.b * other.b);
    }

    sub(other) {
        other = Frac.convertOther(other);
        return new Frac(this.a * other.b - other.a * this.b, this.b * other.b);
    }

    mul(other) {
        other = Frac.convertOther(other);
        return new Frac(this.a * other.a, this.b * other.b);
    }

    div(other) {
        other = Frac.convertOther(other);
        return this.mul(new Frac(other.b, other.a));
    }

    abs() {
        return new Frac(Math.abs(this.a), this.b);
    }

    valueOf() {
        return this.a / this.b;
    }
    toString() {
        if (this.b === 1)
            return `${this.a}`;
        return `<div class="fraction">${this.a} <div class="line"></div> ${this.b}</div>`;
    }

    static convertOther(other) {
        if (!(other instanceof Frac))
            return new Frac(other, 1);
        else
            return other;
    }

    static #gcd(a,b) {
        a = Math.abs(a);
        b = Math.abs(b);
        if (b > a) {let temp = a; a = b; b = temp;}
        while (true) {
            if (b === 0) return a;
            a %= b;
            if (a === 0) return b;
            b %= a;
        }
    }
}

class GreatNumber {
    constructor(m, a) {
        if (!(m instanceof Frac))
            m = new Frac(m, 1);
        this.m = m;

        if (!(a instanceof Frac))
            a = new Frac(a, 1);
        this.a = a;
    }

    add(b) {
        if (b instanceof GreatNumber)
            return new GreatNumber(this.m.add(b.m), this.a.add(b.a));
        else
            return new GreatNumber(this.m, this.a.add(b));
    }

    sub(b) {
        if (b instanceof GreatNumber)
            return new GreatNumber(this.m.sub(b.m), this.a.sub(b.a));
        else
            return new GreatNumber(this.m, this.a.sub(b));
    }

    mul(b) {
        if (b instanceof GreatNumber)
            throw new Error("Спроба множення двух об'єктів классу BigNum");
        else
            return new GreatNumber(this.m.mul(b), this.a.mul(b));
    }

    div(b) {
        if (b instanceof GreatNumber)
            throw new Error("Спроба ділення двух об'єктів классу BigNum");
        else
            return new GreatNumber(this.m.div(b), this.a.div(b));
    }

    abs() {
        return new GreatNumber(this.m.abs(), this.a.abs());
    }

    toString() {
        let res = "";

        if (this.m == 1)
            res = `M`;
        else if (this.m == -1)
            res = `-M`;
        else
            res = `${this.m.toString()}M`;

        if (this.m == 0)
            return this.a.toString();

        if (this.a < 0)
            res += ` - ${this.a.abs().toString()}`;
        else if (this.a != 0)
            res += ` + ${this.a.toString()}`;

        return res;
    }

    valueOf() {
        return this.m * 9999999999999999999 + this.a;
    }
}

class AdditionalFunctions {
    static copy_arr(arr) {
        let new_arr = [];
        for (let i = 0; i < arr.length; i++) {
            new_arr.push([])
            for (let j = 0; j < arr[0].length; j++)
                if (arr[i][j].constructor.name === Frac.constructor.name)
                    new_arr[i].push(new Frac(arr[i][j].a, arr[i][j].b));
                else if (arr[i][j].constructor.name === GreatNumber.constructor.name)
                    new_arr[i].push(new GreatNumber(arr[i][j].m, arr[i][j].a));
                else
                    new_arr[i].push(arr[i][j]);
        }
        return new_arr;
    }

    static delete_row(arr, delete_i) {
        let new_arr = AdditionalFunctions.copy_arr(arr);
        for (let i = 0; i < new_arr.length; i++)
            new_arr[i].splice(delete_i, 1);
        return new_arr;
    }
}