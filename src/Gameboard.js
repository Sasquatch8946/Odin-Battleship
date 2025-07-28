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
            ship = new Ship((y2 - y1) + 1);
            for (let i = y1; i < y2 + 1; i++) {
                if (this.board[x1][i] === 1) {
                    throw new Error(`coordinate is already occupied; try placing ship elsewhere`);
                } else {
                    this.board[x1][i] = 1;
                    ship.coordinates.push([x1, i]);
                }
            }
        }

        if (x2 - x1 > 0) {
            ship = new Ship((x2 - x1) + 1);
            for (let i = x1; i < x2 + 1; i++) {
                if (this.board[i][y1] === 1) {
                    throw new Error(`coordinate is already occupied; try placing ship elsewhere`);
                } else {
                    this.board[i][y1] = 1;
                    ship.coordinates.push([i, y1]);
                }
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
            //PubSub.publish("shipHit", {coordinates, username});
            const isSunk = isHit[0].isSunk();
            if (isSunk) {
                console.log("ship is sunk");
                const allSunk = this.allShipsSunk();
                if (allSunk) {
                    console.log("All ships have been sunk. Game over.");
                    PubSub.publish("endGame", username);
                } else {
                    console.log("Some ships have not been sunk. Keep playing.");
                    PubSub.publish("shipHit", {coordinates, username});
                }
            } else {
                PubSub.publish("shipHit", {coordinates, username});
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

    createRandomShip (shipLength) {
        return new Ship(shipLength); 
    }

    squareHasShip (coords) {
        const [x, y] = coords;
        return this.board[x][y] === 1;
    }

    rangeHasShip(start, end) {
        const [x1, y1] = start;
        const [x2, y2] = end;
        let hasShip = false;

        if (x2 > x1) {
            for (let i = x1; i < x2 + 1; i++) {
                if (this.board[i][y1] === 1) {
                    hasShip = true;
                    break;
                }
            }
        }

        if (y2 > y1) {
            for (let i = y1; i < y2 + 1; i++) {
                if (this.board[x1][i] === 1) {
                    hasShip = true;
                    break;
                }
            }
        }

        return hasShip;

    }

    calculatePositions (startSquare, length) {
        const [x, y] = startSquare;
        const endPositions = [[x + length, y],
                [x - length, y],
                [x, y - length],
                [x, y + length]
            ]

        const validPositions = endPositions.filter((pos) => {
            // need to test two conditions
            // 1. coordinates are in bounds
            // 2. every square between start and end
            //    is not occupied by another ship
            // need to implement a function that sorts the coordinates
            // from low to high
            // considered only going in positiveX and positiveY directions
            // but realized this was make it impossible to calculate placements
            // from the rightmost edge
            // had already thought of implementing sorting
            // in the placeShip method
            const sortedCoordinates = this.sortCoordinates([startSquare, pos]);
            return this.#isWithinBoundary(pos) && !this.rangeHasShip(sortedCoordinates[0],
                sortedCoordinates[1]
            );
        });

        return validPositions;
        
    }

    placeRandomShip (randomShip) {
        let startSquare = this.#getRandomStartSquare()
        let positions = this.calculatePositions(startSquare, randomShip.length);
        console.log(startSquare);
        console.log(positions);
        while (positions.length === 0) {
            startSquare = this.#getRandomStartSquare();
            positions = this.calculatePositions(startSquare, randomShip.length);
        }
        const randomIndex = Gameboard.#randomIntFromInterval(0, positions.length - 1);
        console.log(randomIndex);
        this.placeShip(startSquare, positions[randomIndex]);
    }

    static #randomIntFromInterval (min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    #getRandomStartSquare () {
        let randomX = Gameboard.#randomIntFromInterval(1, 10) - 1; // adding 1 sometimes results in 11
        let randomY = Gameboard.#randomIntFromInterval(1, 10) - 1;
        while (this.board[randomX][randomY] === 1) {
            randomX = Gameboard.#randomIntFromInterval(1, 10) - 1;
            randomY = Gameboard.#randomIntFromInterval(1, 10) - 1;
        }

        return [randomX, randomY];
    }

    #isWithinBoundary (coordinates) {
        const [x, y] = coordinates;
        return (x < 11 && x > -1) &&
                (y < 11 && y > -1);

    }

    sortCoordinates (coordinatePair) {
        let first;
        let second;
        const items = coordinatePair.flat();
        const [x1, y1, x2, y2] = items;
            if (x1 < x2 || y1 < y2) {
            first = [x1, y1];
            second = [x2, y2];
        } else if (x2 < x1 || y2 < y1) {
            first = [x2, y2];
            second = [x1, y1];
        } 

        return [first, second];
    }
}


export default Gameboard;