var path = require('path');

// note: this is NOT universal mapper for now. This is only example mapper for testing.
module.exports =  function (data) {
    var humanReadable = {};
    for (var name in data) {
        var key = path.basename(name, '.js');
        humanReadable[key] = data[name].phaser.map(function (match) {
            return match[1];
        });
    }
    return humanReadable;
}
