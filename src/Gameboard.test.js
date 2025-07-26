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

    });
});