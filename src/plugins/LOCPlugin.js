module.exports = {
    name: "LOCPlugin",
    readFiles: function (fs, files) {
        return files.map(function (fileName) {
            var loc = fs.readFileSync(fileName, 'utf8').split('\n').length;
            return {
                file: fileName,
                loc: loc
            };
        });
    }
}
