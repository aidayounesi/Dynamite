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
        let predictedOppMove = Bot.predictNextMove(Bot.getStrMoves(gamestate, 'p2'), 1);
        let myPredictedMove = Bot.predictNextMove(Bot.getStrMoves(gamestate, 'p1'), 1)

        let myMove = this.decideMyMove(predictedOppMove, myPredictedMove);

        if (myMove === 'D')
            this.usedDynamite++;

        return myMove;
    }


    decideMyMove(oppPredMove, myPredMove) {
        let myPossibleMoves = beatenBy[oppPredMove].slice(0); //clone it to new array

        //if maximum number of dynamites has been reached remove 'D' from the possible moves (if there is any D)
        if (this.usedDynamite >= maxNoDynamites) {
            let indD = myPossibleMoves.indexOf('D');
            if (indD > -1)
                myPossibleMoves.splice(indD, 1);
        }

        // if there are more than one possible moves, remove my predicted move, so I won't play so predictably
        if (myPossibleMoves.length > 1) {
            let ind = myPossibleMoves.indexOf(myPredMove);
            if (ind > -1)
                myPossibleMoves.splice(ind, 1);
        }
        // console.log('opp move: '+oppPredMove+'\t my predicted move: '+myPredMove+'\t'+myPossibleMoves+'\t'+ move)

        //for now choose randomly between possible moves based on opponent predicted move
        return myPossibleMoves[Math.floor(Math.random()*myPossibleMoves.length)];
    }


    /**
     * predict the player move based on his last n moves
     * @param gamestatStr history of moves that has been made by the player
     * @param n
     * @return {string}
     */
    static predictNextMove(gamestatStr, n) {
        let possibleMoves =  gameMoves;
        let oppUsedDynamite = Bot.occurrences(gamestatStr, 'D', false);
        // if max number of dynamites has been reached remove it from opponent's possible moves
        if (oppUsedDynamite >=  maxNoDynamites)
            possibleMoves = possibleMoves.slice(0, possibleMoves.length-1);

        let maxProbability = -1;
        let predictedMove = '';
        //iterate over all possible moves, predict the one is more probable given his last n moves
        for (let i in possibleMoves) {
            let lastNMoves = gamestatStr.substring(gamestatStr.length-n);
            let probability = Bot.conditionalProbability(gamestatStr, possibleMoves[i], lastNMoves);
            if (probability > maxProbability) {
                maxProbability = probability;
                predictedMove = possibleMoves[i];
            }
        }
        return predictedMove;
    }

    /**
     * Calculate P(event|given) = P(event&given)/P(given)
     * @param {string} event
     * @param {string} given
     * @param {string} situation
     * @return {number} conditional probability P(event|given)
     */
    static conditionalProbability(situation, event, given) {
        let p_given = 1.0*Bot.occurrences(situation, given, true);
        if (p_given === 0)
            return 0;
        return Bot.occurrences(situation, given+event, true) / p_given;
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