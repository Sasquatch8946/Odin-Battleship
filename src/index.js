import './styles.css';
import Gameboard from './Gameboard';
import Player from './Player';
import Ship from './Ship';
import DisplayController from './DisplayController';


function main () {
    const player1 = new Player("Player 1");
    const player2 = new Player("Player 2");
    player1.gameboard.placeShip([0, 0], [1, 0]);
    player1.gameboard.placeShip([0, 2], [0, 5]);
    player1.gameboard.placeShip([3, 0], [3, 2]);
    player1.gameboard.placeShip([4, 9], [8, 9]);
    player1.gameboard.placeShip([5, 6], [7, 9]);

    player2.gameboard.placeShip([4, 5], [7, 5]);
    player2.gameboard.placeShip([6, 2], [8, 2]);
    player2.gameboard.placeShip([1, 2], [1, 3]);
    player2.gameboard.placeShip([1, 8], [5, 8]);
    player2.gameboard.placeShip([0, 5], [0, 7]);

    DisplayController.populateGameBoard(player1);
    DisplayController.populateShips(player1);
    DisplayController.populateGameBoard(player2);
    DisplayController.populateShips(player2);

    DisplayController.activateStartButton();
}

main();
