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
});