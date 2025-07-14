import Player from './Player';
import Gameboard from './Gameboard';

describe("Player module", () => {
    test("Should initialize an empty board for a new player", () => {
        const p = new Player();
        expect(p.gameboard).toBeInstanceOf(Gameboard);
    });
});