// possible moves in this game, always D should be at the end
const gameMoves = ['R', 'P', 'S', 'W', 'D'];
const maxNoDynamites = 100;
const maxPoints = 1000;
const maxRounds = 2500;
// each move can be beaten by some moves
const beatenBy = {
    'R':['P', 'D'],
    'P':['S', 'D'],
    'S':['R', 'D'],
    'W':['R', 'P', 'S'],
    'D':['W']};

class Bot {
    constructor() {
        this.usedDynamite = 0;
    }

    makeMove(gamestate) {

        // This is giving us a list of prediction for next move of opponent
        // We try to limit it by using longer n-grams
        let predictedOppMove = gameMoves;
        let oppGameStateStr = Bot.getStrMoves(gamestate, 'p2');
        for (let n = 2; n < oppGameStateStr.length; n++) {
            predictedOppMove = Bot.predictNextMove(oppGameStateStr, n);
            if (predictedOppMove.length === 1)
                break;
        }

        let myPredictedMove = Bot.predictNextMove(Bot.getStrMoves(gamestate, 'p1'), 1);

        let myMove = 'W';
        if (oppGameStateStr.length % 11 !== 0)
             myMove = this.decideMyMove(predictedOppMove, myPredictedMove);

        if (myMove === 'D')
            this.usedDynamite++;

        return myMove;
    }


    decideMyMove(oppPredMove, myPredMove) {
        let myPossibleMovesSet = new Set(gameMoves.slice(0));
        oppPredMove.forEach(oppMove =>
            myPossibleMovesSet = new Set([...myPossibleMovesSet].filter(x => (new Set(beatenBy[oppMove])).has(x))));

        let myPossibleMoves = Array.from(myPossibleMovesSet);
        if (myPossibleMovesSet.size === 0)
            myPossibleMoves = gameMoves.slice(0);
        // console.log(oppPredMove+'\t'+[...myPossibleMoves].join(' '));
        // beatenBy[oppPredMove].slice(0); //clone it to new array


        //if maximum number of dynamites has been reached remove 'D' from the possible moves (if there is any D)
        if (this.usedDynamite >= maxNoDynamites) {
            let indD = myPossibleMoves.indexOf('D');
            if (indD > -1)
                myPossibleMoves.splice(indD, 1);
        }

        // // if there are more than one possible moves, remove my predicted move, so I won't play so predictably
        // if (myPossibleMoves.length > 1) {
        //     let ind = myPossibleMoves.indexOf(myPredMove);
        //     if (ind > -1)
        //         myPossibleMoves.splice(ind, 1);
        // }

        //for now choose randomly between possible moves based on opponent predicted move
        let move = myPossibleMoves[Math.floor(Math.random()*myPossibleMoves.length)];
        // console.log('opp move: '+oppPredMove+'\t my predicted move: '+myPredMove+'\t'+myPossibleMoves+'\t'+ move);

        return move;
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

    /**
     * predict the player move(s) based on his last n moves
     * @param gamestatStr history of moves that has been made by the player
     * @param n
     * @return Array<String>
     */
    static predictNextMove(gamestatStr, n) {
        let possibleMoves =  gameMoves;
        let oppUsedDynamite = Bot.occurrences(gamestatStr, 'D', false);
        // if max number of dynamites has been reached remove it from opponent's possible moves
        if (oppUsedDynamite >=  maxNoDynamites)
            possibleMoves = possibleMoves.slice(0, possibleMoves.length-1);

        let lastNMoves = gamestatStr.substring(gamestatStr.length-n);
        let maxProbability = -1;
        let movesWithMaxProbabilities = [];
        //iterate over all possible moves, and calculate probability of each
        for (let i in possibleMoves) {
            let probability = Bot.conditionalProbability(gamestatStr, possibleMoves[i], lastNMoves);
            if ( probability > maxProbability) {
                maxProbability = probability;
                movesWithMaxProbabilities = [];
                movesWithMaxProbabilities.push(possibleMoves[i]);
            }
            else if ( probability === maxProbability ) {
                movesWithMaxProbabilities.push(possibleMoves[i]);
            }
        }
        return movesWithMaxProbabilities;
    }

    /**
     * Calculate P(event|given) = P(event&given)/P(given)
     * @param {string} event
     * @param {string} given
     * @param {string} situation
     * @return {number} conditional probability P(event|given)
     */
    static conditionalProbability(situation, event, given) {
        if (situation.length - given.length + 1 === 0)
            return 0;
        let p_given = 1.0 * Bot.occurrences(situation, given, true) / (situation.length - given.length + 1);
        if (p_given === 0)
            return 0;
        if (situation.length - given.length - event.length + 1 === 0)
            return 0;
        let p_given_and_event = 1.0*Bot.occurrences(situation, given+event, true) /
                                (situation.length - given.length - event.length + 1);
        return  p_given_and_event / p_given;
    }

    /**
     * @param {JSON} gamestate
     * @param {string} playerName 'p1' or 'p2'
     * @return {string} all the p1 or p2 moves in the gamestate as a string
     */
    static getStrMoves(gamestate, playerName) {
        let oppMoves = '';
        for (let i in gamestate.rounds) {
            oppMoves += gamestate.rounds[i][playerName];
        }
        return oppMoves;
    }

    /** Function that count occurrences of a substring in a string;
     * @param {String} string               The string
     * @param {String} subString            The sub string to search for
     * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
     *
     * @author Vitim.us https://gist.github.com/victornpb/7736865
     * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
     * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
     */
     static occurrences(string, subString, allowOverlapping) {

        string += "";
        subString += "";
        if (subString.length <= 0) return (string.length + 1);

        let n = 0,
            pos = 0,
            step = allowOverlapping ? 1 : subString.length;

        while (true) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) {
                ++n;
                pos += step;
            } else break;
        }
        return n;
    }
}

module.exports = new Bot();