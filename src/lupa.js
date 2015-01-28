var glob = require('glob');
var fs = require('fs');

function run(pattern, callback) {
    glob(pattern, {}, function (err, files) {
        callback(err, files);
    });
}

module.exports = {
    run: run
}


if (require.main === module) (function startFromCLI() {
    var plugins = [require('./plugins/SizePlugin')];
    run("mocks/**/*.js", function (err, files) {
        plugins.forEach(function (plugin) {
            var res = plugin.read(fs, files);
            console.log(res);
        });
    });
})();
