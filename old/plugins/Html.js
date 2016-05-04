var _ = require('lodash');

function stripComments(code) {
    return code.replace(/<!--[\s\S]*?-->/g, '');
}

function stripAttributes(code) {
    return code;
}

function stripText(code) {
    return code;
}


function parseClasses(code) {
    var re, match;

    var classes = [];
    //re = /class=(['"])(.*?)\1/g;
    var re = /\sclass=(((["'])(.*?)\3)|(\w+))/g;
    while (match = re.exec(code)) {
        Array.prototype.push.apply(
            classes,
            (match[4] || match[5]).split(' ').filter(function (s) {
                return !!s;
            }).map(function (c) {
                return '.' + c;
            })
        );
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