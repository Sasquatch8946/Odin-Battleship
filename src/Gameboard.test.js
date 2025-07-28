import Gameboard from './Gameboard';

describe("Gameboard module", () => {
    let gb;
    beforeAll(() => gb = new Gameboard());

    test("Board should have 10 rows of length 10", () => {
        expect(gb.board.every((row) => row.length === 10)).toBe(true);
    });

    test("Should have a placeShip method that places ship at specific coordinates", () => {
        gb.placeShip([2, 2], [6, 2]);
        for (let i = 2; i < 7; i++) {
            expect(gb.board[i][2]).toBe(1);
        }
    });

    test("The placeship method should not change the length of the row or column array", () => {
        expect(gb.board.every((row) => row.length === 10)).toBe(true);
    });

    test("The placeShip method should throw an error if one attempts to place a ship where one already exists", () => {
        expect(() => {
            gb.placeShip([2, 2], [2, 6]);
        }).toThrow('coordinate is already occupied; try placing ship elsewhere');
    });

    test("Should have a receiveAttack method that increments hit count on ship and returns true if hit", () => {
        expect(gb.receiveAttack([3, 2])).toBe(true);
    });

    test("The receiveAttack method returns false if miss.", () => {
        expect(gb.receiveAttack([9, 9])).toBe(false);
    });

    test("Should have an allShipsSunk method that returns false is all ships are not sunk", () => {
        expect(gb.allShipsSunk()).toBe(false);
    });

    test("The allShipsSunk method should return true if all ships on the board are sunk", () => {
        for (let i = 0; i < gb.ships[0].length - 1; i++) {
            gb.ships[0].hit();
        }
        expect(gb.allShipsSunk()).toBe(true);
    });

    test("The createRandomShip method should return a new ship", () => {
        expect(gb.createRandomShip(5).length).toBe(5);
    });

    test("The squareHasShip method should return true if a set of coordinates is already occupied by a ship", () => {
        expect(gb.squareHasShip([2, 2])).toBe(true);
    });

    test("The placeRandomShip method should increase the ship count", () => {
        const randomShip = gb.createRandomShip(5);
        gb.placeRandomShip(randomShip);
        expect(gb.ships.length).toBe(2);
    });

    test("The calculatePositions method should generate all possible end squares for a given starting point and length", () => {
        expect(gb.calculatePositions([0, 0], 3)).toEqual(expect.arrayContaining([[0, 3], [3, 0]]));
    });

    test("Should be able to sort coordinates", () => {
        const unsortedArr = [[2, 0], [0, 0]];
        const expected = [[0, 0], [2, 0]];
        expect(gb.sortCoordinates(unsortedArr)).toStrictEqual(expected);
        // comment
    });

});