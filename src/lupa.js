var glob = require('glob');
var fs = require('fs');

var _ = require('lodash');


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
                console.log("DEBUG Data from plugin ",plugin.name, ": ", JSON.stringify(res, null, 2), "\n");
                return res;
            });
        }

        return getDataFromPlugins(plugins).map(function (filesMetadata) {
            return _.indexBy(filesMetadata, 'file');
        }).reduce(function (dict, chunk) {
            return _.merge(dict, chunk);
        }, {});
    }
};
