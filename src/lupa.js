var glob = require('glob');
var fs = require('fs');
var _ = require('lodash');

var plugins_ = ['./plugins/SizePlugin', './plugins/LOCPlugin.js'].map(require);


var lupa = module.exports = {
    run: function run(pattern, plugins, callback) {
        var lupa = this;
        glob(pattern, {}, function (err, files) {
            var data = lupa.analyzeFiles(files, plugins);
            callback(err, data);
        });
    },
    analyzeFiles: function analyzeFiles (files, plugins) {
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

}


if (require.main === module) (function startFromCLI() {

    lupa.run("mocks/**/*.js", plugins_, function (err, data) {
        console.log("Output data: ", JSON.stringify(data, null, 2));
    });
})();
