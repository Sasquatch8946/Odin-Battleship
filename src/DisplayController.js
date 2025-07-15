const DisplayController = (function () {

    const populateGameBoard = function (gameboard) {
        const parent = document.querySelector("div.container");
        for (let i = 0; i < gameboard.board.length; i++) {
            const row = document.createElement("div");
            row.classList.add("row");
            parent.appendChild(row);
            for (let j = 0; j < gameboard.board[i].length; j++) {
                const column = document.createElement("div");
                column.classList.add("column");
                row.appendChild("column");
            }
        }
    }


    return {
        populateGameBoard,
    }
})();

export default DisplayController;