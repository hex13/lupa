// @lupa labels: file, loc, lines, count, size, info

module.exports = function () {
    return function (code, filename) {
        var lines = code.split('\n').length;
        var size = code.length;
        return {
            lines: lines,
            size: size,
            name: filename
        };
    };
}
