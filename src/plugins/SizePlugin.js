module.exports = function SizePlugin () {
    return {
        readFiles: function (fs, files) {
            return files.map(this.readFile.bind(this, fs));
        },
        readFile: function (fs, fileName) {
            return {
                file: fileName,
                size: fs.statSync(fileName).size
            }
        }
    }
};
