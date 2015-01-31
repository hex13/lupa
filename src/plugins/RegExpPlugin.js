module.exports = function RegExpPlugin (regexp, propName) {
    // TODO if regexp is global
    //  then data[name2].abc = []
    // else data[name2].abc = null;
    // this is inconsistent.

    return {
        readFile: function (fs, fileName) {
                var res = {
                    file: fileName,
                };
                var content = fs.readFileSync(fileName, 'utf8');

                var match;
                var matches = [];
                if (regexp.global) {
                    while (match = regexp.exec(content)) {
                        matches.push(match);
                    }
                } else {
                    matches = regexp.exec(content);
                }
                res[propName] = matches;
                return res;
        }
    }
};
