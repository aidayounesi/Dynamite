const Rules = require('./Rules');

class BotTest {
    constructor() {
        this.usedDynamite = 0;
    }
    makeMove(gamestate) {
        return this.getRandomMove();
    }

    getRandomMove() {
        let possibleMoves = Rules.gameMoves;

        // if max number of dynamites has been reached remove it from possible moves
        if (this.usedDynamite >= Rules.maxNoDynamites)
            possibleMoves = possibleMoves.slice(0, possibleMoves.length-1);

        // randomly select a move from possible moves
        let selectedMove =  possibleMoves[Math.floor(Math.random()*possibleMoves.length)];

        if (selectedMove === 'D')
            this.usedDynamite++;

        return selectedMove;
    }
}

module.exports = new BotTest();