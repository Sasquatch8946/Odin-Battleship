import Ship from './Ship';


describe("Ship module", () => {
    let s;
    beforeEach(() => {
        s = new Ship(5);
    });

    test("It should be initialized with zero hits", () => {
        expect(s.hits).toBe(0);
    });

    test("It should have a length that matches the parameter passed to the constructor",
        () => {
            const expectedLength = 5;
            expect(s.length).toBe(expectedLength);
    });

    test("Should have a hit() method that increases number of hits", () => {
        const originalHits = s.hits;
        s.hit();
        expect(s.hits).toBe(originalHits + 1);
    });

    test("Has a isSunk() method that returns false if number of hits is less than length", () => {
        expect(s.isSunk()).toBe(false);
    });

    test("isSunk() method returns true if hits is greater than or equal to length", () => {
        for (let i = 0; i < 5; i++) {
            s.hit();
        }

        expect(s.isSunk()).toBe(true);
    });
});