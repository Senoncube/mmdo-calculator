let project_n = 5;
let resultElement = document.getElementById("result");

document.querySelector("#project_n").oninput = function () {
    let proj_inp = document.querySelector("#project_n");

    if (!check_input(proj_inp)) {
        proj_inp.value = project_n;
        return;
    }

    let t = parseInt(proj_inp.value);

    if (t < 1) {
        show_error("Кількість проектів не може бути меньше одного!");
        proj_inp.value = project_n;
        return;
    }

    let dif = t - project_n;

    if (dif > 0) {
        for (let i = 0; i < dif; i++)
            document.querySelector("#project_row").innerHTML += `<td>${project_n + i + 1} проект</td>`;
        for (let i = 0; i < 3; i++) {
            let row = document.querySelector(`#task_table tr:nth-child(${i + 3})`);
            for (let j = 0; j < dif; j++) {
                let td = document.createElement("td");
                td.innerHTML = "<input min=\"0\" type=\"number\" value=\"0\">";
                row.appendChild(td);
            }

        }
    } else {
        for (let i = 0; i < 4; i++) {
            let row = document.querySelector(`#task_table tr:nth-child(${i + 2})`);
            for (let j = 0; j < Math.abs(dif); j++) {
                row.children[row.children.length - 1].outerHTML = "";
            }

        }
    }

    project_n = t;
    document.querySelector("#long-cell").colSpan = project_n;
    document.querySelector("#project_restrict").max = project_n;
}

function check_input(inp) {
    let t = parseFloat(inp.value);

    if (isNaN(t) || t < 0 || (t - Math.floor(t) !== 0)) {
        if (isNaN(t))
            show_error("Всі поля повинні бути заповнені числами!");
        else if (t < 0)
            show_error("Всі числа повинні бути додатними!");
        else if (t - Math.floor(t) !== 0)
            show_error("Всі значення повинні бути цілими числами!");

        return false;
    }
    return true;
}

function check_inputs() {
    let fl = true;
    document.querySelectorAll("input").forEach((inp) => {
        if (!fl)
            return;
        if (!check_input(inp))
            fl = false;
        else if (inp.id === "project_n") {
            if (!fl)
                inp.value = project_n;
            if (parseFloat(inp.value) < 1) {
                show_error("Кількість проектів не може бути меньше одного!");
                fl = false;
            }
        }
    })
    return fl;
}


document.getElementById("start").onclick = () => {
    if (!check_inputs())
        return;

    let inp = document.querySelector("#project_restrict");
    if (inp.id === "project_restrict") {
        if (parseFloat(inp.value) > project_n) {
            show_error("Неможливий номер будинку!");
            return;
        }
    }

    let arr = [];
    for (let i = 0; i < 3; i++) {
        let tr = document.querySelector("#task_table tbody").children[2 + i];
        arr.push([]);

        for (let j = 0; j < project_n; j++) {
            arr[i].push(tr.children[j + 1].children[0].value);
        }
    }

    let const_arr = [];
    document.querySelectorAll("#task_text input").forEach((inp) => {
        const_arr.push(parseInt(inp.value));
    });

    arr.forEach((val, i) => {
        arr[i] = parseArr(val);
    })

    hide_error();
    resultElement.classList.add("visible");

    setTimeout(() => {
        resultElement.scrollIntoView({behavior: "smooth"});
    }, 1);

    let simplex_arr = [
        ["", "C", 0, ...arr[2], 0, 0, 0, new GreatNumber(-1, 0), new GreatNumber(-1, 0)],
        ["", "B"],
        [0, `x${project_n + 1}`, const_arr[4] * const_arr[2], ...arr[0], 1, 0, 0, 0, 0],
        [0, `x${project_n + 2}`, const_arr[4] * const_arr[3], ...arr[1], 0, 1, 0, 0, 0],
        [new GreatNumber(-1, 0), `x${project_n + 5}`, const_arr[0], ...new Array(project_n).fill(1), 0, 0, 0, 0, 1],
        [new GreatNumber(-1, 0), `x${project_n + 4}`, const_arr[6]],
        ["", "Δ", ...new Array(project_n + 6).fill(0)]
    ];

    for (let i = 0; i < project_n + 6; i++)
        simplex_arr[1].push(`x${i}`);
    for (let i = 0; i < project_n; i++)
        if ((i + 1) === const_arr[5])
            simplex_arr[5].push(1);
        else
            simplex_arr[5].push(0);

        //console.log(simplex_arr)
    simplex_arr[5].push(0, 0, -1, 1, 0);

    let simplexTable = new SimplexArr(simplex_arr, project_n);

    simplexSolve(simplexTable);

}

function show_error(text) {
    alert(text);
    /*let errorElement = document.getElementById("error");
    errorElement.style.display = "block";
    errorElement.querySelector('h4').innerText = text;
    document.getElementById("start").style.display = "none";*/
}

function hide_error() {
    /*document.getElementById("error").classList.remove("visible");
    document.getElementById("error").style.display = "none";
    document.getElementById("start").style.display = "block";*/
}

function checkNumbers(nums) {
    for (let i = 0; i < nums.length; i++) {
        let temp = parseFloat(nums[i]);
        if (isNaN(temp))
            return 2;
        else if (temp < 0)
            return 1;
        else if (temp - Math.floor(temp) !== 0)
            return 3;
    }
    return 0;
}

function parseArr(arr) {
    let newArr = [];
    arr.forEach((i) => {
        newArr.push(parseFloat(i));
    });
    return newArr;
}


