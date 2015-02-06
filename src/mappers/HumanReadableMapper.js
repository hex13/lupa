var path = require('path');

// note: this is NOT universal mapper for now. This is only example mapper for testing.
function HumanReadableMapper (data) {
    var humanReadable = {};
    for (var name in data) {
        var key = path.basename(name, '.js');
        humanReadable[key] = data[name].phaser.map(function (match) {
            return match[1];
        });
    }
    return humanReadable;
}

module.exports = function () {
    return HumanReadableMapper;
}
