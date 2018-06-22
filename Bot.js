const Rules = require('./Rules');

class Bot {
    constructor() {
        this.usedDynamite = 0;
        this.opponentStr = '';
    }

    makeMove(gamestate) {
        this.setStrOpponentMoves(gamestate);
        let predictedOppMove = this.predictOpponentNextMove(1);
        let myMove = this.decideMyMove(predictedOppMove);

        if (myMove === 'D')
            this.usedDynamite++;

        return myMove;
    }


    decideMyMove(oppPredMove) {
        let myPossibleMoves = Rules.beatenBy[oppPredMove];

        //if maximum number of dynamites has been reached remove 'D' from the possible moves (if there is any D)
        if (this.usedDynamite >= Rules.maxNoDynamites) {
            let indD = myPossibleMoves.indexOf('D');
            if (indD > -1)
                myPossibleMoves.splice(indD, 1);
        }

        //for now choose randomly between possible moves based on opponent predicted move
        return myPossibleMoves[Math.floor(Math.random()*myPossibleMoves.length)];
    }


    /**
     * predict the opponent move based on his last n moves
     * @param n
     * @return {string}
     */
    predictOpponentNextMove(n) {
        let possibleMoves = Rules.gameMoves;
        let oppUsedDynamite = Bot.occurrences(this.opponentStr, 'D', false);
        // if max number of dynamites has been reached remove it from opponent's possible moves
        if (oppUsedDynamite >= Rules.maxNoDynamites)
            possibleMoves = possibleMoves.slice(0, possibleMoves.length-1);

        let maxProbability = -1;
        let predictedMove = '';
        //iterate over all possible moves, predict the one is more probable given his last n moves
        for (let i in possibleMoves) {
            let lastNMoves = this.opponentStr.substring(this.opponentStr.length-n);
            let probability = Bot.conditionalProbability(this.opponentStr, possibleMoves[i], lastNMoves);
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
     * @param gamestate
     * set the this.opponentStr equals to to all the p2 or opponent moves in the gamestate
     */
    setStrOpponentMoves(gamestate) {
        let oppMoves = '';
        for (let i in gamestate.rounds) {
            oppMoves += gamestate.rounds[i].p2;
        }
        this.opponentStr = oppMoves;
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