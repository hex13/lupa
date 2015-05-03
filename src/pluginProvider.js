var extname = require('path').extname;
var plugins = require('./plugins');

module.exports = function PluginProvider () {
    return function pluginProvider (filename) {
        var ext = extname(filename).substring(1);
        var map = {
            'rb': plugins.RailsRoutes
        };
        return map[ext]? [map[ext]] : [];
    }
};