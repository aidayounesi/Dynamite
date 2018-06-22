class Rules {
    constructor() {
        // possible moves in this game, always D should be at the end
        this.gameMoves = ['R', 'P', 'S', 'W', 'D'];

        this.maxNoDynamites = 100;

        this.maxPoints = 1000;

        this.maxRounds = 2500;

        // each move can be beaten by some moves
        this.beatenBy = {
            'R':['P', 'D'],
            'P':['S', 'D'],
            'S':['R', 'D'],
            'W':['R', 'P', 'S'],
            'D':['W']};
    }
}

// export the object instead of class -> singleton pattern
module.exports = new Rules();