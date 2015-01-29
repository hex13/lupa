var glob = require('glob');
var fs = require('fs');
var _ = require('lodash');

function run(pattern, callback) {
    glob(pattern, {}, function (err, files) {
        callback(err, files);
    });
}

module.exports = {
    run: run
}


if (require.main === module) (function startFromCLI() {
    var plugins = ['./plugins/SizePlugin', './plugins/LOCPlugin.js'].map(require);
    run("mocks/**/*.js", function (err, files) {
        var dataFromPlugins = plugins.map(function (plugin) {
            var res = plugin.readFiles(fs, files);
            console.log("Data from plugin ",plugin.name, ": ", JSON.stringify(res, null, 2), "\n");
            return res;
        });

        var data = dataFromPlugins.reduce(function (result, dataFromPlugin) {
            return dataFromPlugin.reduce(function (result, fileData) {
                var dict = result[fileData.file] || (result[fileData.file] = {});
                _.assign(dict, fileData);
                return result;
            }, result);
        }, {});
        console.log("Output data: ", JSON.stringify(data, null, 2));
    });
})();
