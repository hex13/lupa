module.exports = function RegExpPlugin (regexp, propName) {
    return {
        readFiles: function (fs, files) {
            return files.map(function (fileName) {
                var res = {
                    file: fileName,
                };
                var content = fs.readFileSync(fileName, 'utf8');
                res[propName] = content.match(regexp);
                return res;
            });
        }
    }
};
