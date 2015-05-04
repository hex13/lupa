module.exports = function ObjectFileMapper () {
    return function (filename) {
        return '@' + filename;
    };
};