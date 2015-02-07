var RegExpPlugin = require('./RegExpPlugin');

module.exports = function CommonJSPlugin() {
    var regExpPlugin = RegExpPlugin(/require.*\( *(['"])(.*?)\1 *?\)/g, 'requires', {removeDuplicates: true})
    return {
        readFile: function (fs, fileName) {
            var content = fs.readFileSync(fileName, 'utf8');
            var modules = regExpPlugin.readFile(fs, fileName)
                            .requires
                            .map(function (matches) { return matches[2] });
            return {
                file: fileName,
                children: modules
            }
        }
    }
};
