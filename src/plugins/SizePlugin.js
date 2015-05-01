module.exports = function SizePlugin () {
    return function (fs, fileName) {
        return {
            file: fileName,
            size: fs.statSync(fileName).size
        }
    }
};
