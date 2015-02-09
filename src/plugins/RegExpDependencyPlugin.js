var RegExpPlugin = require('./RegExpPlugin');

module.exports = function RegExpDependencyPlugin(regexp, matchIndex) {
    var regExpPlugin = RegExpPlugin(regexp, 'requires', {removeDuplicates: true})
    return {
        readFile: function (fs, fileName) {
            var content = fs.readFileSync(fileName, 'utf8');
            var modules = regExpPlugin.readFile(fs, fileName)
                            .requires
                            .map(function (matches) {
                                return {
                                    name: matches[matchIndex]
                                }
                            });
            return {
                file: fileName,
                //TODO it doubles
                name: fileName,
                children: modules
            }
        }
    }
};
