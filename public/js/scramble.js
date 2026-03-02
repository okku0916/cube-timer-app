const MOVES = ["U", "R", "L", "F", "B", "D", "U'", "R'", "L'", "F'", "B'", "D'", "U2", "R2", "L2", "F2", "B2", "D2"]
const INVERSE = {"U": "D", "D": "U", "L": "R", "R": "L", "F": "B", "B": "F"} // 対応する逆面

function createScramble() {
    const length = 20;
    scramble = [];
    for (let i = 0; i < length; i++) {
        while (true) {
            const n = Math.floor(Math.random() * 18);
            const newMove = MOVES[n];
            if (isValid(scramble, newMove)) {
                scramble.push(newMove);
                break;
            }
        }
    }
    return scramble;
}

function isValid(scramble, newMove) {
    if (scramble.length != 0) {
        prevMove = scramble[scramble.length - 1];
    } else {
        return true; // 一手目は有効
    }

    // 直前と同じ面を回す手は無効
    if (newMove == prevMove[0] || newMove == prevMove[0] + "'" || newMove == prevMove[0] + "2") {
        return false;
    }

    // 逆面を回す場合は辞書式なら有効
    if (INVERSE[prevMove[0]] == newMove[0]) {
        if (prevMove[0] < newMove[0]) {
            return false;
        }
    }
    return true;
}