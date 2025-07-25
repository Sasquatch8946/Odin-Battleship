import Gameboard from './Gameboard';

class Player {
    constructor (name, isComputer = false) {
        this.gameboard = new Gameboard();
        this.name = name;
        this.isComputer = isComputer;
    }

    setPlayerToComputer () {
        this.isComputer = true;
    }
}

export default Player;