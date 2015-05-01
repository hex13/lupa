module.exports = function LOCPlugin() {
    return function (fs, fileName, code) {
        var loc = code.split('\n').length;
        return {
            file: fileName,
            loc: loc
        };
    }
};
