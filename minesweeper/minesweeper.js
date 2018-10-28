const PICTURES = {
    hidden: 'img/hidden.png',
    flag: 'img/flag.png',
    question: 'img/question.png',
    mine: 'img/mine.png',
    misplaced: 'img/misplaced.png',
    0: 'img/0.png',
    1: 'img/1.png',
    2: 'img/2.png',
    3: 'img/3.png',
    4: 'img/4.png',
    5: 'img/5.png',
    6: 'img/6.png',
    7: 'img/7.png',
    8: 'img/8.png',
};
const NEXT_FLAG = {
    hidden: 'flag',
    flag: 'question',
    question: 'hidden',
};


class Minesweeper {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.numMines = Math.ceil(this.rows * this.columns / 10);
        this.numMinesRemaining = this.numMines;
        this.playing = true;
        this.initBoard();
        this._adjustNumMinesRemaining(0);
    }

    /**
     * Sets up the game by randomly seeding mines and calulating 
     * the number of adjacent mines for each cell.
     */
    initBoard() {
        this.board = new Array(this.rows);
        this.tile = new Array(this.rows);
        this.picture = new Array(this.rows);

        for(let row = 0; row < this.rows; row++) {
            this.board[row] = new Array(this.columns);
            this.tile[row] = new Array(this.columns);
            this.picture[row] = new Array(this.columns);
        }

        this._placeMines();
        this._setEmptyCellValues();
        this._displayBoard();
        this._setupEventHandlers();
        // this.printBoard();  // DEBUG
    }

    _placeMines() {
        let numMinesPlaced = 0;

        while(numMinesPlaced < this.numMines) {
            const row = Math.floor(Math.random() * this.rows),
                col = Math.floor(Math.random() * this.columns);

            if(this.board[row][col] !== 'mine') {
                this.board[row][col] = 'mine';
                this.picture[row][col] = 'hidden';
                numMinesPlaced++;
            }
        }
    }

    _setEmptyCellValues() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.columns; col++) {
                if(this.board[row][col] === undefined) {
                    this.board[row][col] = this._getNumberOfAdjacentMines(row, col);
                    this.picture[row][col] = 'hidden';
                }
            }
        }
    }

    _getNumberOfAdjacentMines(row, column) {
        const bounds = this._getNeighborBounds(row, column);
        let adjacentMines = 0;

        for(let r = bounds.lowerRow; r <= bounds.upperRow; r++) {
            for(let c = bounds.lowerCol; c <= bounds.upperCol; c++) {
                if(r === row && c === column) continue;
                if(this.board[r][c] === 'mine') {
                    adjacentMines++;
                }
            }
        }

        return adjacentMines;
    }

    _displayBoard() {
        const container = document.getElementById('container');

        let gameboard = document.createElement('div');
        gameboard.id = 'gameboard';

        for(let r = 0; r < this.rows; r++) {
            let rowDiv = document.createElement('div')
            for(let c = 0; c < this.columns; c++) {
                const imgNode = document.createElement('img');
                imgNode.src = PICTURES[this.picture[r][c]];
                imgNode.setAttribute('row', r);
                imgNode.setAttribute('col', c);
                this.tile[r][c] = imgNode;
                rowDiv.appendChild(imgNode);
            }
            gameboard.appendChild(rowDiv);
        }
        container.appendChild(gameboard);
    }

    _setupEventHandlers() {
        for(const cell of document.getElementById('gameboard').getElementsByTagName('img')) {
            cell.addEventListener('click', this.handleClick.bind(this));
            cell.addEventListener('contextmenu', this.handleClick.bind(this));
        }
    }

    // Debug Only
    printBoard() {
        for(const row of this.board) {
            let rowStr = '';
            for(const colVal of row) {
                rowStr += colVal === 'mine' ? ' m' : ` ${colVal}`
            }
            console.log(rowStr);
        }
    }

    _getNeighborBounds(row, column) {
        return {
            lowerRow: row === 0 ? 0 : row - 1,
            upperRow: row === this.rows - 1 ? this.rows - 1 : row + 1,
            lowerCol: column === 0 ? 0 : column - 1,
            upperCol: column === this.columns - 1 ? this.columns - 1 : column + 1
        }
    }

    handleClick(event) {
        if(!this.playing)
            return;

        event.preventDefault();
        const row = parseInt(event.target.getAttribute('row')),
            col = parseInt(event.target.getAttribute('col'));

        if(event.which === 3) {
            const currentImage = this.picture[row][col];

            if(NEXT_FLAG.hasOwnProperty(currentImage)) {
                let nextFlag = NEXT_FLAG[currentImage];
                this.picture[row][col] = nextFlag;
                this.tile[row][col].src = PICTURES[nextFlag];

                if(nextFlag === 'flag') {
                    this._adjustNumMinesRemaining(-1);
                    this._checkGameStatus();
                } else if(currentImage === 'flag') {
                    this._adjustNumMinesRemaining(+1);
                }
            }
        } else if(event.which === 1 && this.picture[row][col] === 'hidden') {
            if(this.board[row][col] === 'mine') {
                this.lose();
            } else {
                this.reveal(row, col);
                this._checkGameStatus();
            }
        }
    }

    _adjustNumMinesRemaining(adjustment) {
        let gameStatus = document.getElementById('game-status');

        if(gameStatus === null) {
            gameStatus = document.createElement('p');
            gameStatus.id = 'game-status';
            document.getElementById('container').appendChild(gameStatus);
        }

        this.numMinesRemaining += adjustment;
        gameStatus.innerHTML = `${this.numMinesRemaining} mines remaining.`;
    }

    reveal(row, col) {
        if(this.picture[row][col] === 'hidden' && this.board[row][col] !== 'mine') {
            const cellValue = this.board[row][col];
            this.picture[row][col] = PICTURES[cellValue];
            this.tile[row][col].src = PICTURES[cellValue];

            if(cellValue === 0) {
                const bounds = this._getNeighborBounds(row, col);
                for(let r = bounds.lowerRow; r <= bounds.upperRow; r++) {
                    for(let c = bounds.lowerCol; c <= bounds.upperCol; c++) {
                        if(r === row && c === col) continue;
                        if(this.picture[r][c] === 'hidden') {
                            this.reveal(r, c);
                        }
                    }
                }
            }
        }
    }

    /**
     * Win the game only if we've placed as many flags as mines, and there are no hidden cells.
     */
    _checkGameStatus() {
        if(this.numMinesRemaining > 0) {
            return;
        }

        let numMinesCorrectlyFlagged = 0;
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.columns; col++) {
                if(this.picture[row][col] === 'hidden') {
                    return;
                } else if(this.picture[row][col] === 'flag') {
                    if (this.board[row][col] === 'mine') {
                        numMinesCorrectlyFlagged += 1;
                    } else {
                        return;
                    }
                }
            }
        }
        if(numMinesCorrectlyFlagged === this.numMines) {
            this.win();
        }
    }

    win() {
        this._endGame('You Win!');
    }

    lose() {
        this._endGame('Game Over.');

        // Show all of the mines and show any incorrectly flagged mines.
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.columns; col++) {
                if(this.picture[row][col] === 'flag' && this.board[row][col] !== 'mine') {
                    this.picture[row][col] = 'misplaced';
                    this.tile[row][col].src = PICTURES.misplaced;
                }
                if(this.picture[row][col] !== 'flag' && this.board[row][col] === 'mine') {
                    this.picture[row][col] = 'mine';
                    this.tile[row][col].src = PICTURES.mine;
                }
            }
        }
    }

    _endGame(message) {
        this.playing = false;
        const newGameButton = document.createElement('button');
        newGameButton.innerHTML = 'Start Over';
        newGameButton.addEventListener('click', this.newGame)
        document.getElementById('container').appendChild(newGameButton);
        document.getElementById('game-status').innerHTML = message;
    }

    newGame() {
        document.getElementById('container').innerHTML = '';
        new Minesweeper(5, 5);
    }
}