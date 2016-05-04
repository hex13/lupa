var _ = require('lodash');

function stripComments(code) {
    return code;
}

function stripAttributes(code) {
    return code.replace(/\{.*\}/g, '');
}

function stripText(code) {
    return code.replace(/\s+\w.*/g, '');
}



// TODO this is the same function we used in sass plugin
// consider extract it to shared module rather than copy pasting
function parseClasses(code) {
    var re, match;

    var classes = [];
    re = /(\.[a-zA-Z][\w-]*)/g;
    while (match = re.exec(code)) {
        classes.push(match[1]);
    }
    return _.uniq(classes);
}

module.exports = function () {

    return function (code) {
        code = stripComments(code);
        code = stripAttributes(code);
        code = stripText(code);
        var classes = parseClasses(code);

        var data = {
            classes: classes
        };
        return data;
    };
};