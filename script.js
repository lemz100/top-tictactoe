function Gameboard () {
    const rows = 3;
    const columns = 3;
    const board = [];

    // Populates board array with 3x3 grid used for the game.
    for(let i=0; i<rows; i++){
        board[i] = [];
        for(let j=0; j<columns; j++){
            board[i].push(Cell());
        }
    }

    // Gets the board
    const getBoard = () => board;

    // Adds mark (X or O in row & column)
    const markCell = (row, column, player) => {
        let validMove; // Boolean variable to decide whether move gets replayed.
        const desiredRow = board[row];
        const desiredColumn = desiredRow[column];
        if(desiredColumn.getMark() === ""){
            validMove = true;
            desiredColumn.addMark(player);
            return validMove;
        } else {
            validMove = false; // Re-do move.
            alert("Column filled - pick a new one.");
            return validMove;
        }
    };

    return { getBoard, markCell };
}

function Cell() {
    let value = "";

    // Changes value based on the player.
    const addMark = (player) => {
        value = player;
    };

    // Gets cell value.
    const getMark = () => value;

    return {addMark, getMark};
}

function GameController(playerOneName = "Player 1", playerTwoName = "Player 2") {
    // Instantialize game board
    const board = Gameboard();

    // Instantialize players object
    const players = [
        {
            name: playerOneName,
            mark: "0"
        },
        {
            name: playerTwoName,
            mark: "X"
        }
    ];

    // Sets active player to player 1 by default.
    let activePlayer = players[0];

    const changePlayerName = (playerNum, name) => {
        players[playerNum].name = name;
    }

    // Ternary operator - if activeplayer = 1st player then switch to 2nd player else keep.
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }

    // Gets current active player
    const getActivePlayer = () => activePlayer;

    // Checks win by row - if mark is consistent across a row = win.
    // Returns winning mark.
    const checkHorizontalWin = () => {
        const boardArr = board.getBoard();
        for(let i=0; i<boardArr.length; i++){
            const arr = boardArr[i].map((cell) => cell.getMark());
            if ((arr[0] === "X" || arr[0] === "0") && arr.every(mark => mark === arr[0])) {
                return arr[0];
            }
        }
        return null;
    }

    // Checks win by column - if mark is consistent across a column = win.
    // Returns winning mark.
    const checkVerticalWin = () => {
        const boardArr = board.getBoard();
        for(let i=0; i<boardArr.length; i++){
            const arr = boardArr.map((row) => row[i].getMark());
            if ((arr[0] === "X" || arr[0] === "0") && arr.every(mark => mark === arr[0])) {
                return arr[0];
            }
        }
        return null;
    }

    // Checks win by diagonals - if mark is consistent across a diagonal path = win
    // Returns winning mark depending on diagonal.
    const checkDiagWin = () => {
        const boardArr = board.getBoard();
        // First diagonal TopLeft > BottomRight
        if (boardArr[0][0].getMark() !== "") {
            const diag1Mark = boardArr[0][0].getMark();
            if (boardArr[1][1].getMark() === diag1Mark && boardArr[2][2].getMark() === diag1Mark) {
                return diag1Mark;``
            }
        }
        // Second diagonal TopRight > BottomLeft
        if (boardArr[0][2].getMark() !== "") {
            const diag2Mark = boardArr[0][2].getMark();
            if (boardArr[1][1].getMark() === diag2Mark && boardArr[2][0].getMark() === diag2Mark) {
                return diag2Mark;
            }
        }
        return null;
        }

    const checkTie = () => {
        const boardArr = board.getBoard();
        for(let i=0; i<boardArr.length; i++){
            for(let j=0; j<boardArr[i].length; j++){
                if(boardArr[i][j].getMark() === ""){
                    return false;
                }
            }
        }
        return true;
    }

    // Main playing function.
    const playRound = (row, column) => {
        const validMove = board.markCell(row, column, getActivePlayer().mark);
        if(!validMove){
            return; // If move is invalid, breaks function and user makes a next move.
        }

        // Winner checking functions.
        const horizontalWinner = checkHorizontalWin();
        const verticalWinner = checkVerticalWin();
        const diagonalWinner = checkDiagWin();

        // If either condition returns true = assigns the winner mark to its player.
        if(horizontalWinner || verticalWinner || diagonalWinner){
            const winnerMark = horizontalWinner || verticalWinner || diagonalWinner; // First non-null winner mark
            return `${winnerMark === "X" ? players[1].name : players[0].name} wins!`;
        } else if (checkTie()) {
            return "Its a draw!"; // Checks if game hits a draw.
        }

        switchPlayerTurn();
    };

    return {
        changePlayerName,
        playRound,
        getActivePlayer,
        getBoard: board.getBoard
    };
}

function UserInterface(game) {
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const gameStatus = document.querySelector('.game-status');

    // Refresh screen
    const updateScreen = () => {
        // Clear the board
        boardDiv.textContent = "";
        
        // Get newest version of board and player's turn.
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        // Display players turn
        playerTurnDiv.textContent = `${activePlayer.name}'s turn...`

        // Render board squares onto the div
        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellButton = document.createElement('button');
                cellButton.classList.add("cell");
                cellButton.dataset.column = colIndex; // Applies column index to the cell
                cellButton.dataset.row = rowIndex; // Applies row index to the cell
                cellButton.textContent = cell.getMark();
                boardDiv.append(cellButton);
            });
        });

    }

    // Board reset method
    const resetBoard = () => {
        // Game over message.
        playerTurnDiv.textContent = "Game over!";
        // Removes click function from cells to prevent further interaction with board.
        boardDiv.removeEventListener("click", clickHandlerBoard);
    }

    // Resets game status message
    if(gameStatus.textContent!== ""){
        gameStatus.textContent = "";
    }

    // Event listener for the board
    function clickHandlerBoard(e) {
        const selectedColumn = e.target.dataset.column; // Selects column using button column dataset
        const selectedRow = e.target.dataset.row; // Selects row using button row dataset.
        if(!selectedColumn || !selectedRow) return; // Returns if invalid/no selection.
        const result = game.playRound(selectedRow, selectedColumn);
        // Screen refresh
        updateScreen();

        // Game Status displays result of the game based on its return value.
        if(result) {
            gameStatus.textContent = result;
            resetBoard();
        }
    }
        
    boardDiv.addEventListener("click", clickHandlerBoard);
    // Initial render
    updateScreen();
}

// Game start up
const startButton = document.querySelector("#start-gamebtn");

// Start button to start up the game from the button.
startButton.addEventListener("click", () => {
    // Prompts to enter desired user names.
    const player1Name = prompt("Enter Player 1 name: ") || "Player 1";
    const player2Name = prompt("Enter Player 2 name: ") || "Player 2";

    // Instantializes game variable and changes player names
    const game = GameController();
    game.changePlayerName(0, player1Name);
    game.changePlayerName(1, player2Name);

    // Starts up user interface with game variable.
    UserInterface(game);
})


