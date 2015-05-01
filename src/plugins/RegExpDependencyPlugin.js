var RegExpPlugin = require('./RegExpPlugin');

module.exports = function RegExpDependencyPlugin(regexp, matchIndex) {
    var regExpPlugin = RegExpPlugin(regexp, 'requires', {removeDuplicates: true})
    return function (fs, fileName, content) {
        var modules = regExpPlugin(fs, fileName, content)
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
};
