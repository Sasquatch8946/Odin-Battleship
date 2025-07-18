import PubSub from "pubsub-js";

const DisplayController = (function () {

    let currentPlayer;

    const getCurrentPlayer = function () {
        return currentPlayer;
    }

    const setCurrentPlayer = function (player) {
        currentPlayer = player;
    }

    const pickRandomSquare = function () {

    }

    const computerAttack = function () {

    }

    const getUserFromGameboard = function (element) {
        return element.parentNode.parentNode.dataset.user;
    }

    const getGameboardByUser = function (username) {
        return document.querySelector(`div.gameboard[data-user='${username}'`);
    }

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

    const activateGameboard = function () {
        const currentPlayer = getCurrentPlayer();
        if (!currentPlayer.isComputer) {
            const gameboard = getGameboardByUser(getCurrentPlayer().name);
            gameboard.parentNode.classList.add("turn");
            gameboard.addEventListener("click", receiveAttack);
        } else {
            // automate attacks
        }
    }

    const activateStartButton = function () {
        const btn = document.querySelector("button");
        btn.addEventListener("click", () => {
            // highlight player 1's gameboard
            // pubsub
            console.log("start button clicked");
            activateGameboard();
        });
    }

    const isAlreadyClicked = function (element) {
        const cl = Array.from(element.classList);
        return cl.indexOf("hit") > -1 ||
                cl.indexOf("miss") > -1 ||
                cl.indexOf("z") > -1;
    }

    const receiveAttack = function (event) {
        if (!isAlreadyClicked(event.target)) {
            const x = getXCoordinate(event.target);
            const y = getYCoordinate(event.target);
            const coordinates = [x, y];
            console.log(`${x}, ${y}`);
            event.target.parentNode.parentNode.removeEventListener("click", receiveAttack);
            event.target.closest("div.gameboard-wrapper").classList.remove("turn");
            const username = getUserFromGameboard(event.target);
            // pubsub
            PubSub.publish("attackRegistered", {username, coordinates});
        }
    }

    const getXCoordinate = function (element) {
        const childList = Array.from(element.parentNode.children);
        return childList.indexOf(element) - 1;
    }

    const getYCoordinate = function (element) {
        const rowList = Array.from(element.parentNode.parentNode.children);
        return rowList.indexOf(element.parentNode) - 1;
    }

    const convertToDisplayCoordinates = function (coordinates) {
        const [x, y] = coordinates;
        return [x+1, y+1];
    }

    const markHit = function (_msg, data) {
        const {coordinates, username} = data;
        const square = getSquare(coordinates, username);
        square.classList.add("hit");
        const s = document.createElement("span");
        s.classList.add("z");
        square.appendChild(s);
        PubSub.publish("endOfTurn", username);
    }

    const getSquare = function (coordinates, username) {
        const [x, y] = coordinates;
        const gameboard = getGameboardByUser(username);
        const rows = gameboard.querySelectorAll("div.row:has(div.column)");
        const columns = rows[y].querySelectorAll("div.column");
        const hit = columns[x];
        return hit;
    }

    const markMiss = function (_msg, data) {
        const {username, coordinates} = data;
        const square = getSquare(coordinates, username);
        square.classList.add("miss");
        const s = document.createElement("span");
        s.classList.add("miss-dot");
        square.appendChild(s);
        PubSub.publish("endOfTurn", username);
    }

    const startNewTurn = function (_msg, nextPlayer) {
        setCurrentPlayer(nextPlayer);
        activateGameboard();
    }

    PubSub.subscribe("shipHit", markHit);

    PubSub.subscribe("miss", markMiss);

    PubSub.subscribe("startOfTurn", startNewTurn);

    return {
        populateGameBoard,
        populateShips,
        activateStartButton,
        getCurrentPlayer,
        setCurrentPlayer,
    }
})();

export default DisplayController;