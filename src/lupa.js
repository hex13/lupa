var glob = require('glob');
var fs = require('fs');

var _ = require('lodash');

var Q = require('q');


var lupa = module.exports = {
    run: function run(pattern, plugins) {
        var deferred = Q.defer();
        var lupa = this;
        glob(pattern, {}, function (err, files) {
            var data = lupa.analyzeFiles(files, plugins);
            deferred.resolve(data);
        });
        return deferred.promise;
    },
    analyzeFiles: function analyzeFiles (files, plugins) {
        return plugins
            .map(function readFiles(plugin) {
                return files.map(plugin.readFile.bind(plugin, fs));
            })
            .map(function (filesMetadata) {
                return _.indexBy(filesMetadata, 'file');
            })
            .reduce(function (dict, chunk) {
                return _.merge(dict, chunk);
            }, {});
    }
};
