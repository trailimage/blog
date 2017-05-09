"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const regex_1 = require("../regex");
function leadingZeros(d, count) {
    let text = d.toString();
    while (text.length < count) {
        text = '0' + text;
    }
    return text;
}
exports.leadingZeros = leadingZeros;
function sayNumber(n, capitalize = true) {
    let word = n.toString();
    switch (n) {
        case 1:
            word = 'One';
            break;
        case 2:
            word = 'Two';
            break;
        case 3:
            word = 'Three';
            break;
        case 4:
            word = 'Four';
            break;
        case 5:
            word = 'Five';
            break;
        case 6:
            word = 'Six';
            break;
        case 7:
            word = 'Seven';
            break;
        case 8:
            word = 'Eight';
            break;
        case 9:
            word = 'Nine';
            break;
        case 10:
            word = 'Ten';
            break;
        case 11:
            word = 'Eleven';
            break;
        case 12:
            word = 'Twelve';
            break;
        case 13:
            word = 'Thirteen';
            break;
        case 14:
            word = 'Fourteen';
            break;
        case 15:
            word = 'Fifteen';
            break;
        case 16:
            word = 'Sixteen';
            break;
        case 17:
            word = 'Seventeen';
            break;
        case 18:
            word = 'Eighteen';
            break;
        case 19:
            word = 'Nineteen';
            break;
        case 20:
            word = 'Twenty';
            break;
    }
    return capitalize ? word : word.toLowerCase();
}
exports.sayNumber = sayNumber;
function parseNumber(text) {
    text = (text ? text : '').replace(/[^\d\.]/g, '');
    return is_1.default.empty(text) ? NaN : parseFloat(text);
}
exports.parseNumber = parseNumber;
function maybeNumber(val) {
    return (regex_1.default.numeric.test(val)) ? parseFloat(val) : val;
}
exports.maybeNumber = maybeNumber;
//# sourceMappingURL=number.js.map