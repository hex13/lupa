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

    function analyzeFiles (files) {
        function getDataFromPlugins(plugins) {
            return plugins.map(function (plugin) {
                var res = plugin.readFiles(fs, files);
                console.log("Data from plugin ",plugin.name, ": ", JSON.stringify(res, null, 2), "\n");
                return res;
            });
        }

        function mergeDataFromPlugins(dataFromPlugins) {
            return dataFromPlugins.reduce(function (result, dataFromPlugin) {
                return dataFromPlugin.reduce(function (result, fileData) {
                    var dict = result[fileData.file] || (result[fileData.file] = {});
                    _.assign(dict, fileData);
                    return result;
                }, result);
            }, {});
        }

        return mergeDataFromPlugins(getDataFromPlugins(plugins));


    }

    run("mocks/**/*.js", function (err, files) {
        var data = analyzeFiles(files);
        console.log("Output data: ", JSON.stringify(data, null, 2));
    });
})();
