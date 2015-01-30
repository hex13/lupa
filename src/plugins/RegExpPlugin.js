module.exports = function RegExpPlugin (regexp, propName) {
    return {
        readFiles: function (fs, files) {
            return files.map(function (fileName) {
                var res = {
                    file: fileName,
                };
                var content = fs.readFileSync(fileName, 'utf8');
                res[propName] = regexp.test(content);
                return res;
            });
        }
    }
};
