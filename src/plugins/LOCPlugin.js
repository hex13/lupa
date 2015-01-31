module.exports = function LOCPlugin() {
    return {
        readFile: function (fs, fileName) {
            var loc = fs.readFileSync(fileName, 'utf8').split('\n').length;
            return {
                file: fileName,
                loc: loc
            };
        }
    }
};
