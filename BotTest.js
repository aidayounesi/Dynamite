const gameMoves = ['R', 'P', 'S', 'W', 'D']; // possible moves in this game, always D should be at the end
const maxNoDynamites = 100;

class BotTest {
    constructor() {
        this.usedDynamite = 0;
    }
    makeMove(gamestate) {
        return this.getRandomMove();
    }

    getRandomMove() {
        let possibleMoves = gameMoves;

        // if max number of dynamites has been reached remove it from possible moves
        if (this.usedDynamite >= maxNoDynamites)
            possibleMoves = possibleMoves.slice(0, possibleMoves.length-1);

        // randomly select a move from possible moves
        let selectedMove =  possibleMoves[Math.floor(Math.random()*possibleMoves.length)];

        if (selectedMove === 'D')
            this.usedDynamite++;

        return selectedMove;
    }
}

module.exports = new BotTest();