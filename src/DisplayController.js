import PubSub from "pubsub-js";
import Player from "./Player";

const DisplayController = (function () {

    const setPlayers = function (playersArray) {
        players = playersArray;
    }

    const setCurrentPlayer = function (player) {
        currentPlayer = player;
    }


    let currentPlayer;
    let players;

    const getOpponentBoard = function () {
        const currentPlayer = getCurrentPlayer();
        const opponent = players.filter((p) => p != currentPlayer)[0];
        return getGameboardByUser(opponent.name);
    }

    const getOpponent = function (username) {
        const opponent = players.filter((p) => p.name !== username)[0];
        return opponent;
    }

    const getCurrentPlayer = function () {
        return currentPlayer;
    }

    const setBannerMessage = function (msg) {
        const msgDiv = document.querySelector("div.messages");
        msgDiv.innerText = msg;
    }

    const nextTurn = function () {
        const currentPlayer = getCurrentPlayer();
        const nextPlayer = players.filter((p) => p != currentPlayer)[0];
        setCurrentPlayer(nextPlayer);
        setBannerMessage(`${nextPlayer.name}'s turn`);
        activateGameboard();
    }

    const randomIntFromInterval = function (min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const getRandomSquare = function () {
        let randomX = randomIntFromInterval(1, 10) - 1; // adding 1 sometimes results in 11
        let randomY = randomIntFromInterval(1, 10) - 1;
        let square = getSquare([randomX, randomY]);
        while (isAlreadyClicked(square)) {
            randomX = randomIntFromInterval(1, 10) - 1; // adding 1 here sometimes resulted in 11
            randomY = randomIntFromInterval(1, 10) - 1; 
            square = getSquare([randomX, randomY]);
        }

        return square;
    }

    const computerAttack = function () {
        const square = getRandomSquare();
        sendAttack(square);
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
        gbTitle.innerText = `${player.name} grid`;
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
        setBannerMessage(`${currentPlayer.name}'s turn`);
        if (!currentPlayer.isComputer) {
            const gameboard = getOpponentBoard();
            gameboard.parentNode.classList.add("turn");
            gameboard.addEventListener("click", receiveManualAttack);
        } else {
            // automate attacks
            computerAttack();
        }
    }

    const activateComputerStart = function () {
        const btn = document.querySelector("button.computer");
        btn.addEventListener("click", () => {
            PubSub.publish("gameType", "computer");
            activateGameboard();
        });
    }

    const activateHumanStart = function () {
        const btn = document.querySelector("button.human");
        btn.addEventListener("click", () => {
            PubSub.publish("gameType", "human");
            activateGameboard();
        });
    }


    const isAlreadyClicked = function (element) {
        const cl = Array.from(element.classList);
        return cl.indexOf("hit") > -1 ||
                cl.indexOf("miss") > -1 ||
                cl.indexOf("z") > -1;
    }

    const receiveManualAttack = function (event) {
        sendAttack(event.target);
    }

    const sendAttack = function (element) {
        if (!isAlreadyClicked(element)) {
            const x = getXCoordinate(element);
            const y = getYCoordinate(element);
            const coordinates = [x, y];
            console.log(`${x}, ${y}`);
            element.parentNode.parentNode.removeEventListener("click", receiveManualAttack);
            element.closest("div.gameboard-wrapper").classList.remove("turn");
            const username = getUserFromGameboard(element);
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
        const square = getSquare(coordinates);
        square.classList.add("hit");
        const s = document.createElement("span");
        s.classList.add("z");
        square.appendChild(s);
        nextTurn();
    }

    const getSquare = function (coordinates) {
        const [x, y] = coordinates;
        const gameboard = getOpponentBoard();
        const rows = gameboard.querySelectorAll("div.row:has(div.column)");
        const columns = rows[y].querySelectorAll("div.column");
        const hit = columns[x];
        return hit;
    }

    const markMiss = function (_msg, data) {
        const {username, coordinates} = data;
        const square = getSquare(coordinates);
        square.classList.add("miss");
        const s = document.createElement("span");
        s.classList.add("miss-dot");
        square.appendChild(s);
        nextTurn();
    }

    const startNewTurn = function (_msg, nextPlayer) {
        setCurrentPlayer(nextPlayer);
        activateGameboard();
    }

    const deactivateGameboard = function () {
        const gameboard = getOpponentBoard();
        gameboard.parentNode.classList.remove("turn");
        gameboard.removeEventListener("click", receiveManualAttack);
    }

    const endGame = function (_msg, losingPlayer) {
        const winner = getOpponent(losingPlayer);
        setBannerMessage(`Game over. ${winner.name} won.`);
        deactivateGameboard();    
    }

    PubSub.subscribe("shipHit", markHit);

    PubSub.subscribe("miss", markMiss);

    PubSub.subscribe("startOfTurn", startNewTurn);

    PubSub.subscribe("endGame", endGame);

    return {
        populateGameBoard,
        populateShips,
        activateComputerStart,
        activateHumanStart,
        getCurrentPlayer,
        setCurrentPlayer,
        setPlayers,
    }
})();

export default DisplayController;