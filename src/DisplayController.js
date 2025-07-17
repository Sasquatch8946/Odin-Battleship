import PubSub from "pubsub-js";

const DisplayController = (function () {

    const createColumnLabels = function (gameboardDiv) {
        const letters = 'abcdefghij'.toUpperCase().split('');
        const labelRow = document.createElement("div");
        labelRow.classList.add("row"); 
        gameboardDiv.appendChild(labelRow);
        for (let i = 0; i < 11; i++) {
            const columnLabel = document.createElement("div");
            columnLabel.classList.add("column-label");
            labelRow.appendChild(columnLabel);
            if (i !== 0) {
                columnLabel.innerText = letters[i-1];
            }
        } 
    }

    const populateGameBoard = function (player) {
        const gameboard = player.gameboard;
        const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
        const parent = document.querySelector("div.container");
        const gb = document.createElement("div");
        gb.classList.add("gameboard");
        gb.dataset.user = player.name;
        const gbTitle = document.createElement("div");
        gbTitle.classList.add("gameboard-title");
        gbTitle.innerText = player.name;
        const gbWrapper = document.createElement("div");
        gbWrapper.classList.add("gameboard-wrapper");
        gbWrapper.appendChild(gbTitle);
        gbWrapper.appendChild(gb);
        parent.appendChild(gbWrapper);
        createColumnLabels(gb);
        for (let i = 0; i < gameboard.board.length; i++) {
            const row = document.createElement("div");
            row.classList.add("row");
            gb.appendChild(row);
            for (let j = 0; j < gameboard.board[i].length + 1; j++) {
                const column = document.createElement("div");

                if (j === 0) {
                    column.classList.add("row-label");
                    if (i >= 0) {
                        column.innerText = numbers[i];
                    }
                } else {
                    column.classList.add("column");
                }
                row.appendChild(column);
            }
        }

    }

    const populateShips = function (player) {
        const rows = document.querySelectorAll(`div.gameboard[data-user='${player.name}'] div.row:has(div.column)`);
        player.gameboard.ships.forEach((ship) => {
            ship.coordinates.forEach((coord) => {
                const [x, y] = coord;
                const cols = rows[y].querySelectorAll("div.column");
                cols[x].classList.add("ship");
            });
        });
    }

    const activateStartButton = function () {
        const btn = document.querySelector("button");
        btn.addEventListener("click", () => {
            // highlight player 1's gameboard
            // pubsub
            console.log("start button clicked");
            const player1GameBoard = document.querySelector(".gameboard");
            player1GameBoard.parentNode.classList.add("turn");
            player1GameBoard.addEventListener("click", receiveAttack);
        });
    }

    const receiveAttack = function (event) {
        const x = getXCoordinate(event.target);
        const y = getYCoordinate(event.target);
        console.log(`${x}, ${y}`);
        event.target.parentNode.parentNode.removeEventListener("click", receiveAttack);
        const username = Array.from(event.target.parentNode.parentNode.classList).at(-1);
        // pubsub
        PubSub.publish("attackRegistered", {

        });
    }

    const getXCoordinate = function (element) {
        const childList = Array.from(element.parentNode.children);
        return childList.indexOf(element);
    }

    const getYCoordinate = function (element) {
        const rowList = Array.from(element.parentNode.parentNode.children);
        return rowList.indexOf(element.parentNode);
    }

    return {
        populateGameBoard,
        populateShips,
        activateStartButton,
    }
})();

export default DisplayController;