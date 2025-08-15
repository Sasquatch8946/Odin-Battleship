import './styles.css';
import Player from './Player';
import DisplayController from './DisplayController';
import PubSub from 'pubsub-js';


function main () {

    const player1 = new Player("Player 1");
    const player2 = new Player("Player 2");
    const players = [player1, player2];
    DisplayController.setCurrentPlayer(player1);
    DisplayController.setPlayers(players);

    const getPlayer = function (username) {
        return players.filter((p) => p.name === username)[0];
    }

    player1.gameboard.placeShip([0, 0], [1, 0]);
    player1.gameboard.placeShip([0, 2], [0, 5]);
    player1.gameboard.placeShip([3, 0], [3, 2]);
    player1.gameboard.placeShip([4, 9], [8, 9]);
    player1.gameboard.placeShip([2, 6], [2, 8]);

    player2.gameboard.placeShip([4, 5], [7, 5]);
    player2.gameboard.placeShip([6, 2], [8, 2]);
    player2.gameboard.placeShip([1, 2], [1, 3]);
    player2.gameboard.placeShip([1, 8], [5, 8]);
    player2.gameboard.placeShip([0, 5], [0, 7]);

    DisplayController.populateGameBoard(player1);
    DisplayController.populateShips(player1);
    DisplayController.populateGameBoard(player2);
    DisplayController.populateShips(player2);

    DisplayController.activateComputerStart();
    DisplayController.activateHumanStart();

    PubSub.subscribe("attackRegistered", (_msg, data) => {
        const player = getPlayer(data.username);
        player.gameboard.receiveAttack(data.coordinates, data.username);
    });

    PubSub.subscribe("endOfTurn", (_msg, oldUsername) => {
        const nextPlayer = players.filter((p) => p.name !== oldUsername);
        PubSub.publish("startOfTurn", nextPlayer[0]);
    });

    PubSub.subscribe("gameType", (_msg, gameType) => {
        if (gameType === "computer") {
            player2.setPlayerToComputer();
        }
    });

    PubSub.subscribe("randomize", (_msg, {player, visible}) => {
        console.log(player.name);
        console.log(player.gameboard.ships);
        player.gameboard.randomizeShipPlacements();
        DisplayController.clearPlayerShips(player.name);
        if (visible === true) {
            DisplayController.populateShips(player);
        }

        console.log("after randomizing ship placements");
        console.log(player.gameboard.ships);
    });

    PubSub.subscribe("dropShip", (_msg, data) => {
        const {userName, coordinates} = data;
        const player = getPlayer(userName);
        const firstCoord = coordinates[0];
        const lastCoord = coordinates.at(-1);
        player.gameboard.placeShip(firstCoord, lastCoord);
    });

    PubSub.subscribe("dragNDrop", (_msg, currentPlayerName) => {
       const currentPlayer = getPlayer(currentPlayerName);
       currentPlayer.gameboard.clearShips();
    });
}

main()

