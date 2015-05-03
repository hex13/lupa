var extname = require('path').extname;


module.exports = function ExtBasedPluginProvider (plugins) {
    return function providePluginBasedOnExtension (filename) {
        var ext = extname(filename).substring(1);
        var map = {
            'rb': plugins.RailsRoutes
        };
        return map[ext]? [map[ext]] : [];
    }
};