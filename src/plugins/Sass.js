module.exports = function () {
    return function (code) {

        var mixins = {
            declarations: [],
            uses: []
        };

        var re, match;


        re = /@mixin +([a-zA-z-]+)/g;
        while (match = re.exec(code)) {
            mixins.declarations.push(match[1]);
        }

        re = /(?:\n|^)\s*(?:@include *|\+)([a-zA-z-]+)/g;
        while (match = re.exec(code)) {
            mixins.uses.push(match[1]);
        }

        var data = {
            mixins: mixins
        };
        return data;
    };
};