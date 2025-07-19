import Ship from './Ship';
import PubSub from 'pubsub-js';

class Gameboard {

    constructor () {
        this.board = this.initializeBoard();
        this.misses = [];
        this.ships = [];
    }

    placeShip (coords1, coords2) {
        // TODO: perhaps write some lines that organize coordinates from 'low'
        // to 'high'
        const [x1, y1] = coords1;
        const [x2, y2] = coords2;
        let ship;
        if (y2 - y1 > 0) {
            ship = new Ship(y2 - y1);
            for (let i = y1; i < y2 + 1; i++) {
                this.board[x1][i] = 1;
                ship.coordinates.push([x1, i]);
            }
        }

        if (x2 - x1 > 0) {
            ship = new Ship(x2 - x1);
            for (let i = x1; i < x2 + 1; i++) {
                this.board[i][y1] = 1;
                ship.coordinates.push([i, y1]);
            }
        }

        this.ships.push(ship);

    }

    initializeBoard () {
        const board = [];
        for (let i = 0; i < 10; i++) {
            board[i] = new Array(10).fill(0);
        }

        return board;
    }

    static #areEqualArrays (arr1, arr2) {

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false; // Elements at current index are not equal
            }
        }

        return true;
    }

    receiveAttack (coordinates, username = null) {
        const [x, y] = coordinates;
        const isHit = this.ships.filter((ship) => ship.coordinates.some((c) => Gameboard.#areEqualArrays(c, coordinates)));
        if (isHit.length > 0) {
            isHit[0].hit();
            console.log("It's a hit!");
            PubSub.publish("shipHit", {coordinates, username});
            const isSunk = isHit[0].isSunk();
            if (isSunk) {
                console.log("ship is sunk");
                const allSunk = this.allShipsSunk();
                if (allSunk) {
                    console.log("All ships have been sunk. Game over.");
                    PubSub.publish("endgame", username);
                } else {
                    console.log("Some ships have not been sunk. Keep playing.");
                }
            }
            return true;
        } else {
            console.log("It's a miss :(");
            this.misses.push(coordinates);
            PubSub.publish("miss", {coordinates, username});
            return false;
        }
    }

    allShipsSunk () {
        return this.ships.every((ship) => ship.isSunk());
    }



}


export default Gameboard;