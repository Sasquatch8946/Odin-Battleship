import Gameboard from './Gameboard';

class Player {
    constructor (name) {
        this.gameboard = new Gameboard();
        this.name = name;
    }
}

export default Player;