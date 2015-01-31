module.exports = function SizePlugin () {
    return {
        readFile: function (fs, fileName) {
            return {
                file: fileName,
                size: fs.statSync(fileName).size
            }
        }
    }
};
