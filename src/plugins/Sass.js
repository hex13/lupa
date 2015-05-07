var _ = require('lodash');

function stripComments(code) {
    return code.replace(/\/\/.*/g,'');
}

function parseMixins(code) {
    var re, match;

    var mixins = {
        declarations: [],
        uses: [],
    };

    re = /@mixin +([a-zA-z0-9-]+)/g;
    while (match = re.exec(code)) {
        mixins.declarations.push(match[1]);
    }

    re = /(?:\n|^)\s*(?:@include *|\+)([a-zA-z0-9-]+)/g;
    while (match = re.exec(code)) {
        mixins.uses.push(match[1]);
    }

    mixins.uses = _.uniq(mixins.uses);
    return mixins;
}

function parseVariables (code) {
    var re, match;

    var variables = [];
    re = /(\$[\w-]+)/g;
    while (match = re.exec(code)) {
        variables.push(match[1]);
    }

    return _.uniq(variables);
}


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
        var codeWithoutParentheses = code.replace(/\(.*?\)/g, '');

        var mixins = parseMixins(code);
        var variables = parseVariables(code);
        var classes = parseClasses(codeWithoutParentheses);


        var data = {
            mixins: mixins,
            variables: variables,
            classes: classes

        };
        return data;
    };
};