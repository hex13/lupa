module.exports = function SizePlugin () {
    return {
        readFiles: function (fs, files) {
            return files.map(function (fileName) {
                return {
                    file: fileName,
                    size: fs.statSync(fileName).size
                }
            });
        }
    }
};
