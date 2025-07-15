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
    player1.gameboard.placeShip([3, 0], [3, 3]);
    player1.gameboard.placeShip([4, 9], [9, 9]);
    player1.gameboard.placeShip([5, 9], [7, 9]);

    player2.gameboard.placeShip([4, 5], [8, 5]);
    player2.gameboard.placeShip([5, 2], [8, 2]);
    player2.gameboard.placeShip([9, 2], [9, 3]);
    player2.gameboard.placeShip([1, 8], [6, 8]);
    player2.gameboard.placeShip([7, 5], [7, 7]);

    DisplayController.populateGameBoard(player1);
    DisplayController.populateGameBoard(player2);
}

main();
