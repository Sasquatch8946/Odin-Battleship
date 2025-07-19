import Gameboard from './Gameboard';

class Player {
    constructor (name, isComputer = false) {
        this.gameboard = new Gameboard();
        this.name = name;
        this.isComputer = isComputer;
    }
}

export default Player;