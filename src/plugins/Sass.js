var _ = require('lodash');

module.exports = function () {
    return function (code) {

        var variables = [];
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

        var data = {
            mixins: mixins,
            variables: _.uniq(variables)
        };
        return data;
    };
};