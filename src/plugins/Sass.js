var _ = require('lodash');

module.exports = function () {
    return function (code) {


        var mixins = {
            declarations: [],
        };

        var uses = [];

        var re, match;


        re = /@mixin +([a-zA-z-]+)/g;
        while (match = re.exec(code)) {
            mixins.declarations.push(match[1]);
        }

        re = /(?:\n|^)\s*(?:@include *|\+)([a-zA-z-]+)/g;
        while (match = re.exec(code)) {
            uses.push(match[1]);
        }

        mixins.uses = _.uniq(uses);

        var data = {
            mixins: mixins
        };
        return data;
    };
};