var _ = require('lodash');

module.exports = function () {
    return function (code) {
        var codeWithoutParentheses = code.replace(/\(.*?\)/g, '');

        var variables = [];
        var classes = [];
        var mixins = {
            declarations: [],
        };

        var uses = [];

        var re, match;

        re = /@mixin +([a-zA-z0-9-]+)/g;
        while (match = re.exec(code)) {
            mixins.declarations.push(match[1]);
        }

        re = /(?:\n|^)\s*(?:@include *|\+)([a-zA-z0-9-]+)/g;
        while (match = re.exec(code)) {
            uses.push(match[1]);
        }

        mixins.uses = _.uniq(uses);


        re = /(\$[\w-]+)/g;
        while (match = re.exec(code)) {
            variables.push(match[1]);
        }

        re = /(\.[a-zA-Z][\w-]*)/g;
        while (match = re.exec(codeWithoutParentheses)) {
            classes.push(match[1]);
        }

        var data = {
            mixins: mixins,
            variables: _.uniq(variables),
            classes: _.uniq(classes)

        };
        return data;
    };
};