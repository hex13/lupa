var _ = require('lodash');

module.exports = function RegExpPlugin (regexp, propName, options) {
    // TODO if regexp is global
    //  then data[name2].abc = []
    // else data[name2].abc = null;
    // this is inconsistent.
    options = options || {};

    return function (fs, fileName, content) {
        var res = {
            file: fileName,
        };

        var match;
        var matches = [];
        if (regexp.global) {
            while (match = regexp.exec(content)) {
                matches.push(match);
            }
        } else {
            matches = regexp.exec(content);
        }

        // removes duplicates in according to first (0) part of matches
        // this could change in the future
        res[propName] = options.removeDuplicates? _.uniq(matches, 0) : matches;
        return res;
    }
};
