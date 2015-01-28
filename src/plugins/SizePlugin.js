module.exports = {
    read: function (fs, files) {
        return files.map(function (fileName) {
            return {
                file: fileName,
                size: fs.statSync(fileName).size
            }
        });
    }
};
