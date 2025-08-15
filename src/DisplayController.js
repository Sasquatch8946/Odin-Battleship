import PubSub from "pubsub-js";

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

    const getCurrentPlayerBoard = function () {
        const currentPlayer = getCurrentPlayer();
        return getGameboardByUser(currentPlayer.name);
    }

    const getOpponent = function () {
        const username = getCurrentPlayer().name;
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

    const changeCurrentPlayer = function () {
        const opponent = getOpponent();
        setCurrentPlayer(opponent);
    }

    const nextTurn = async function () {
        const currentPlayer = getCurrentPlayer();
        const nextPlayer = players.filter((p) => p != currentPlayer)[0];
        setCurrentPlayer(nextPlayer);
        setBannerMessage(`${nextPlayer.name}'s turn`);
        await activateGameboard();
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

    const dragover = function (event) {
        event.preventDefault();
    }

    const dragenter = function (event) {
        event.preventDefault();
        console.log("drag enter fired");
    }

    const drop = function (event) {
        event.preventDefault();
        const username = event.target.closest("div.gameboard").dataset.user;
        console.log("drop event fired");
        event.target.classList.add("ship");
        const numChildren = parseInt(event.dataTransfer.getData("childrenText")) - 1;
        const direction = event.dataTransfer.getData("directionText");
        const shipId = event.dataTransfer.getData("shipIdText");
        console.log(numChildren);
        console.log(direction);
        console.log(shipId);
        let x = getXCoordinate(event.target);
        let y = getYCoordinate(event.target);
        let coordinates = [];
        let endX;
        let endY;

        coordinates.push([x, y]);

        if (direction === "row") {
            endX = x + numChildren;
            endY = y;
            for (let i = x; i < endX; i++) {
                coordinates.push([i, endY]);
            }
        } else {
            endY = y + numChildren;
            endX = x;
            for (let i = y; i < endY; i++) {
                coordinates.push([endX, i]);
            }
        }

        coordinates.push([endX, endY]);

        console.log([x, y]);
        console.log([endX, endY]);
        placeShipOnGameboard(username, coordinates);
        const gridAreaShip = document.getElementById(shipId);
        gridAreaShip.remove();

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
                    column.addEventListener("dragover", dragover);
                    column.addEventListener("dragenter", dragenter);
                    column.addEventListener("drop", drop);
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

    const placeShipOnGameboard = function (userName, coordinates) {
        const rows = document.querySelectorAll(`div.gameboard[data-user='${userName}'] div.row:has(div.column)`);
        coordinates.forEach((coord) => {
            const [x, y] = coord;
            const cols = rows[y].querySelectorAll("div.column");
            cols[x].classList.add("ship");
        });

        PubSub.publish("dropShip", {userName, coordinates});

    }

    const changeActiveGameboard = function () {
        const currentPlayerGameBoard = getCurrentPlayerBoard();
        const opponentGameboard = getOpponentBoard();
        const opponent = getOpponent();
        const currentBoardClassList = Array.from(currentPlayerGameBoard.parentNode.classList);
        if (currentBoardClassList.indexOf("obscured") > -1) {
            currentPlayerGameBoard.parentNode.classList.remove("obscured");
        }
        currentPlayerGameBoard.parentNode.classList.add("active");
        clearPlayerShips(opponent.name);
        const opponentBoardClassList = Array.from(opponentGameboard.parentNode.classList);
        if (opponentBoardClassList.indexOf("active") > -1) {
            opponentGameboard.parentNode.classList.remove("active");
        }
    }

    const activateGameboard = async function () {
        const opponent = getOpponent();
        setBannerMessage(`${currentPlayer.name}'s turn`);
        if (!currentPlayer.isComputer) {
            // need to grey out current player's board
            // and remove ships from display
            const currentPlayerGameBoard = getGameboardByUser(currentPlayer.name);
            const opponentGameboard = getOpponentBoard();
            const currentBoardClassList = Array.from(currentPlayerGameBoard.parentNode.classList);
            if (currentBoardClassList.indexOf("obscured") > -1) {
                currentPlayerGameBoard.parentNode.classList.remove("obscured");
            }
            clearPlayerShips(opponent.name);
            opponentGameboard.parentNode.classList.add("active");
            if (!opponent.isComputer) {
                await changeTurn();
            }
            populateShips(currentPlayer);
            opponentGameboard.addEventListener("click", receiveManualAttack);
        } else {
            // automate attacks
            computerAttack();
        }
    }

    const removeHumanStart = function () {
        const humanStart = document.querySelector("button.human");
        humanStart.remove();
    }

    const removeComputerStart = function () {
        const computerStart = document.querySelector("button.computer");
        computerStart.remove();

    }

    const hideOpponentBoard = function () {
        const opponent = getOpponent();
        clearPlayerShips(opponent.name);
    }

    const enterGameSetup = function (human = false) {
        removeComputerStart();
        removeHumanStart();
        newRandomizerButton();
        newManualButton();
        if (human) {
            setBannerMessage(`${getCurrentPlayer().name} - place your ships`);
            changeActiveGameboard();
            newSubmitButton();
        } else {
            newStartButton();
        }
    }

    const activateComputerStart = function () {
        const btn = document.querySelector("button.computer");
        btn.addEventListener("click", () => {
            const opponent = getOpponent();
            PubSub.publish("randomize", {player: opponent, visible: false});
            PubSub.publish("gameType", "computer");
            clearPlayerShips(opponent.name);
            enterGameSetup();
            // need to grey out/conceal the placements of the 
            // computer's ships
            // also randomize computer's ships
            //activateGameboard();
        });
    }

    const activateHumanStart = function () {
        const btn = document.querySelector("button.human");
        btn.addEventListener("click", () => {
            PubSub.publish("gameType", "human");
            enterGameSetup(true);
            //activateGameboard();
        });
    }

    const activateRandomizer = function () {
        const btn = document.querySelector("button.randomizer");
        btn.addEventListener("click", () => {
            const currentPlayer = getCurrentPlayer();
            PubSub.publish("randomize", {player: currentPlayer, visible: true});
        });
    }

    const newStartButton = function () {
        const container = document.querySelector("div.button-container");
        const btn = document.createElement("button");
        btn.classList.add("start-game");
        btn.innerText = "Start";
        container.appendChild(btn);
        btn.addEventListener("click", async function () {
            await activateGameboard();
        });
    }

    const sleep = function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const activatePassScreen = async function () {
        const dialog = document.querySelector("dialog");
        dialog.showModal();
        setTimeout(() => {
            dialog.close();
        }, 5000)
    }

    const changeTurn = async function () {
        await activatePassScreen();
        await sleep(5000);

    }

    const submitGrid = async function () {
        const currentPlayer = getCurrentPlayer();
        changeCurrentPlayer();
        if (currentPlayer.name === "Player 2") {
            await activateGameboard();
        } else {
            changeActiveGameboard();
            await changeTurn();
            setBannerMessage(`${getCurrentPlayer().name} - place your ships`);
            populateShips(getCurrentPlayer());
        }

    }

    const newSubmitButton = function () {
        const container = document.querySelector("div.button-container");
        const btn = document.createElement("button");
        btn.classList.add("submit-grid");
        btn.innerText = "Submit";
        container.appendChild(btn);
        btn.addEventListener("click", submitGrid);
    }


    const rotateShip = function (event) {
        console.log(event.target.parentNode);
        console.log("rotating ship");
        const direction = getComputedStyle(event.target.parentNode).flexDirection;
        console.log(direction);
        if (direction === "row") {
            event.target.parentNode.style.flexDirection = "column";
        } else { 
            event.target.parentNode.style.flexDirection = "row";
        }

        console.log(getComputedStyle(event.target.parentNode).flexDirection);
    }

    const dragstart = function (event) {
        event.dataTransfer.setData("childrenText", event.target.children.length);
        event.dataTransfer.setData("directionText", getComputedStyle(event.target).flexDirection);
        event.dataTransfer.setData("shipIdText", event.target.id);
        /*console.log("dragstart");
        console.log(getComputedStyle(event.target).flexDirection);
        console.log(event.target.style.flexDirection);
        console.log(event.target.style.getPropertyValue("flexDirection"));*/
    }

    const createDragAndDrop = function () {
        const currentPlayer = getCurrentPlayer();
        PubSub.publish("dragNDrop", currentPlayer.name);
        const lengths = [5, 4, 3, 3, 2];
        const container = document.querySelector("div.bigger-container");
        const gridArea = document.createElement("div");
        gridArea.classList.add("grid-area");
        container.appendChild(gridArea);
        for (let i = 0; i < lengths.length; i++) {
            const ship = document.createElement("div");
            ship.classList.add("draggable-ship");
            ship.draggable = true;
            ship.addEventListener("dragstart", dragstart);
            ship.addEventListener("dblclick", rotateShip);
            ship.id = `ship${i}`;
            gridArea.appendChild(ship);
            for (let j = 0; j < lengths[i]; j++) {
                const shipSquare = document.createElement("div");
                shipSquare.classList.add("shipSquare");
                ship.appendChild(shipSquare);
            }
        }

        dePopulateShips(null);
    }

    const activateManualPlacement = function () {
        const btn = document.querySelector("button.manual-placement");
        btn.addEventListener("click", createDragAndDrop);
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
            //element.parentNode.parentNode.removeEventListener("click", receiveManualAttack);
            //element.closest("div.gameboard-wrapper").classList.remove("turn");
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

    const markHit = async function (_msg, data) {
        const {coordinates, shipCoordinates, sunk, endGame} = data;
        const square = getSquare(coordinates);
        square.classList.add("hit");
        const s = document.createElement("span");
        s.classList.add("z");
        square.appendChild(s);
        if (sunk) {
            markSunk(shipCoordinates);
        }

        /*if (!endGame) {
            await nextTurn();
        }*/
    }

    const getShipOrientation = function (coordinates) {
        if (coordinates[1][0] > coordinates[0][0]) {
            return "horizontal";
        } else if (coordinates[1][1] > coordinates[0][1]) {
            return "vertical";
        }
    }

    const markSunkHorizontal = function (coordinates) {
        const style = "2px solid firebrick";
        for (let i = 0; i < coordinates.length; i++) {
            const square = getSquare(coordinates[i]);
            if (i === 0) {
                square.style.borderLeft = style;
                square.style.borderTop = style;
                square.style.borderBottom = style;
            } else if (i === coordinates.length -1) {
                square.style.borderRight = style;
                square.style.borderTop = style;
                square.style.borderBottom = style;
            } else {
                square.style.borderTop = style;
                square.style.borderBottom = style;
            }
        }
    }

    const markSunkVertical = function (coordinates) {
        const style = "2px solid firebrick";
        for (let i = 0; i < coordinates.length; i++) {
            const square = getSquare(coordinates[i]);
            if (i === 0) {
                square.style.borderLeft = style;
                square.style.borderTop = style;
                square.style.borderRight = style;
            } else if (i === coordinates.length -1) {
                square.style.borderRight = style;
                square.style.borderLeft = style;
                square.style.borderBottom = style;
            } else {
                square.style.borderLeft = style;
                square.style.borderRight = style;
            }
        }
    }

    const markSunk = function (shipCoordinates) {
        const orientation = getShipOrientation(shipCoordinates);
        if (orientation === "horizontal") {
            markSunkHorizontal(shipCoordinates);
        } else if (orientation === "vertical") {
            markSunkVertical(shipCoordinates);
        }
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
        deactivateGameboard();
        nextTurn();
    }

    const startNewTurn = async function (_msg, nextPlayer) {
        setCurrentPlayer(nextPlayer);
        await activateGameboard();
    }

    const deactivateGameboard = function () {
        const gameboard = getOpponentBoard();
        gameboard.parentNode.classList.remove("turn");
        gameboard.removeEventListener("click", receiveManualAttack);
    }

    const endGame = function (_msg, losingPlayer) {
        const winner = getCurrentPlayer();
        setBannerMessage(`Game over. ${winner.name} won.`);
        deactivateGameboard();    
    }

    const dePopulateShips = function (_msg) {
        const ships = Array.from(document.querySelectorAll("div.ship"));
        ships.forEach((ship) => {
            ship.classList.remove("ship");
        });
    }

    const clearPlayerShips = function (username) {
        const gameboard = getGameboardByUser(username);
        const ships = Array.from(gameboard.querySelectorAll("div.ship"));
        ships.forEach((ship) => {
            ship.classList.remove("ship");
        });

    }

    const clearOpponentShips = function () {
        const opponent = getOpponent();
    }

    const newRandomizerButton = function () {
        const container = document.querySelector("div.button-container");
        const btn = document.createElement("button");
        btn.classList.add("randomizer");
        btn.innerText = "Randomize grid";
        container.appendChild(btn);
        activateRandomizer();
    }

    const newManualButton = function () {
        const container = document.querySelector("div.button-container");
        const btn = document.createElement("button");
        btn.classList.add("manual-placement");
        btn.innerText = "Manually place ships";
        container.appendChild(btn);
        activateManualPlacement();
    }

    PubSub.subscribe("shipHit", markHit);

    PubSub.subscribe("miss", markMiss);

    PubSub.subscribe("startOfTurn", startNewTurn);

    PubSub.subscribe("endGame", endGame);

    PubSub.subscribe("shipSunk", markSunk);

    return {
        populateGameBoard,
        populateShips,
        activateComputerStart,
        activateHumanStart,
        getCurrentPlayer,
        setCurrentPlayer,
        setPlayers,
        activateRandomizer,
        dePopulateShips,
        activateManualPlacement,
        clearPlayerShips,
    }
})();

export default DisplayController;