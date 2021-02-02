let BOARD_DIM = 10;
let MINES_NUM = 10;
const DIFFICULTIES = {
    "easy": 10,
    "medium": 15,
    "hard": 20
};
const MINES_ON_DIFFICULTY = {
    "easy": 10,
    "medium": 40,
    "hard": 80
};
const COLORS = {
    1: "0,100,0",
    2: "50,100,200",
    3: "150,50,50",
    4: "192, 0, 53",
    5: "255,0,0"
}
let table;
let mines = [];
let timerInterval;
clearInterval(timerInterval);
let time = 0;
let timeString = "";
const timer = document.getElementsByClassName("timer")[0];

const setDifficultyAndStart = (difficulty) => {
    MINES_NUM = MINES_ON_DIFFICULTY[difficulty];
    BOARD_DIM = DIFFICULTIES[difficulty];
    init();
};

const openDifOverlay = () => {
    document.getElementById("start").style.display = "flex";
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
};

const init = () => {
    startTimer();
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    const difficulty = document.getElementById("start");
    difficulty.style.display = "none";
    mines = [];
    table = new Array(BOARD_DIM).fill([])
        .map(x => new Array(BOARD_DIM).fill({})
            .map(y =>
                new Object({
                    val: 0,
                    open: false,
                    mine: false,
                    el: null
                })
            ));

    for (let i = 0; i < MINES_NUM; i++) {
        const randI = Math.floor(Math.random() * BOARD_DIM);
        const randJ = Math.floor(Math.random() * BOARD_DIM);
        if (table[randI][randJ].mine == true) {
            i--;
            continue;
        }
        table[randI][randJ].mine = true;
        mines.push({
            x: randI,
            y: randJ
        });
    }


    for (let mine of mines) {
        const mineX = mine.x;
        const mineY = mine.y;

        for (let i = mineX - 1; i <= mineX + 1; i++) {
            if (i < 0 || i >= BOARD_DIM) continue;
            for (let j = mineY - 1; j <= mineY + 1; j++) {
                if (j < 0) continue;
                if (j >= BOARD_DIM) continue;
                if (mineX === i && mineY === j) continue;
                table[i][j].val++;
            }
        }
    }

    draw(true);
};

const startTimer = () => {
    clearInterval(timerInterval);
    time = 0;
    timeString = ``;
    timerInterval = setInterval(() => {
        time += 1;
        let secondPart = String(time % 60);
        let firstPart = String(Math.floor(time / 60));

        timeString = `${firstPart}:${secondPart.length == 1 ? `0${secondPart}` : secondPart}`;
        document.getElementById("time").innerHTML = timeString;
    },1000);
}

const draw = (first) => {
    const board = document.getElementById("board");
    if (first) {
        board.innerHTML = "";
        board.appendChild(timer);
    }
    document.documentElement.style.setProperty("--dim",BOARD_DIM);
    for (let i = 0; i < BOARD_DIM; i++) {
        for (let j = 0; j < BOARD_DIM; j++) {
            const table_cell = table[i][j];

            if (first) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.setAttribute("x",i);
                cell.setAttribute("y",j);
                if (table_cell.mine) {
                    const img = document.createElement("img");
                    img.src = "mine.png";
                    cell.appendChild(img);
                }
                else if (table_cell.val != 0) {
                    cell.innerHTML = table_cell.val;
                    cell.style.color = `rgba(${COLORS[table_cell.val]},1)`;
                }

                table_cell.el = cell;
                cell.addEventListener("click",onCellClick);
                board.appendChild(cell);
            }

            if (table_cell.open) {
                table_cell.el.classList.add("open");
            }

        }
    }
};

const onCellClick = (ev) => {
    const cell = ev.target;
    const x = Number(cell.getAttribute("x"));
    const y = Number(cell.getAttribute("y"));
    const table_cell = table[x][y];

    if (table_cell.open) return;
    else if (table_cell.val === 0) {
        recursiveOpenEmpty(x,y);
    }
    if (table_cell.mine) {
        lose();
        return;
    } else {
        table_cell.open = true;
    }

    findIfWon();
    draw();
};

const findIfWon = () => {
    let stillPlaying = false;
    for (let i = 0; i < BOARD_DIM; i++) {
        if (stillPlaying) break;
        for (let j = 0; j < BOARD_DIM; j++) {
            if (!table[i][j].open && !table[i][j].mine) {
                stillPlaying = true;
                break;
            }
        }
    }
    if (!stillPlaying) win();
};

const recursiveOpenEmpty = (x,y) => {
    if (x < 0 || x >= BOARD_DIM) return;
    if (y < 0 || y >= BOARD_DIM) return;
    const wasCellOpen = table[x][y].open;
    table[x][y].open = true;

    if (table[x][y].val || wasCellOpen) return;

    /*
        - - -
        x - -
        - - -
    */
    recursiveOpenEmpty(x - 1,y);
    /*
        x - -
        - - -
        - - -
    */
    recursiveOpenEmpty(x - 1,y - 1);
    /*
        - x -
        - - -
        - - -
    */
    recursiveOpenEmpty(x,y - 1);
    /*
        - - x
        - - -
        - - -
    */
    recursiveOpenEmpty(x + 1,y - 1);
    /*
        - - -
        - - x
        - - -
    */
    recursiveOpenEmpty(x + 1,y);
    /*
        - - -
        - - -
        - - x
    */
    recursiveOpenEmpty(x + 1,y + 1);
    /*
        - - -
        - - -
        - x -
    */
    recursiveOpenEmpty(x,y + 1);
    /*
        - - -
        - - -
        x - -
    */
    recursiveOpenEmpty(x - 1,y + 1);
}

const lose = () => {
    clearInterval(timerInterval);
    const overlay = document.getElementById("overlay");
    overlay.style.display = "flex";
    const msg = document.getElementById("overlay-msg");
    msg.innerHTML = "LOSER";
    msg.style.color = "red";
    showMines();
}

const win = () => {
    clearInterval(timerInterval);
    const overlay = document.getElementById("overlay");
    const timeMsg = document.getElementById("time-msg");
    if (timeMsg && timeMsg.parentElement.isEqualNode(overlay)) {
        overlay.removeChild(timeMsg);
    }
    overlay.style.display = "flex";
    const msg = document.getElementById("overlay-msg");
    msg.innerHTML = "WINNER";
    msg.style.color = "#139adf";
    const b = document.createElement("b");
    b.setAttribute("id","time-msg");
    b.innerHTML = `Time: <span class="time">${timeString}</span>`;
    overlay.appendChild(b);
    showMines();
}

const showMines = () => {
    mines.forEach(({ x,y }) => {
        table[x][y].open = true;
    });
    draw();
}


window.addEventListener("load",openDifOverlay);