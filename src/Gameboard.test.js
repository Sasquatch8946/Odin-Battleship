import Gameboard from './Gameboard';

describe("Gameboard module", () => {
    let gb;
    beforeAll(() => gb = new Gameboard());
    test("Should have a placeShip method that places ship at specific coordinates", () => {
        gb.placeShip([2, 2], [6, 2]);
        for (let i = 2; i < 7; i++) {
            expect(gb.board[i][2]).toBe(1);
        }
    });

    test("Should have a receiveAttack method that increments hit count on ship and returns true if hit", () => {
        expect(gb.receiveAttack([3, 2])).toBe(true);
    });

    test("The receiveAttack method returns false if miss.", () => {
        expect(gb.receiveAttack([9, 9])).toBe(false);
    });
});