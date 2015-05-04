var glob = require('glob');
var fs = require('fs');
var _ = require('lodash');
var Q = require('q');
var Handlebars = require('handlebars');
var File = require('./file');
var ExtBasedPluginProvider = require('./ExtBasedPluginProvider');
var ObjectFileMapper = require('./ObjectFileMapper');

var lupa = module.exports = {
    plugins: require('./plugins'),
    fileNames: require('./fileNames'),
    fileNames2: require('./fileNames2'),
    View: require('./views/View.js'),
    isString: function (v) {
        return Object.prototype.toString.call(v) == '[object String]';
    }
};


lupa.pluginProvider = ExtBasedPluginProvider(lupa.plugins);
lupa.mapFileToObject = ObjectFileMapper();

lupa.view = lupa.View();
lupa.view.registerTemplateEngine('handlebars', function (tpl) {
    return Handlebars.compile(tpl);
});

lupa.view.registerTemplate('urls', 'urls.html.handlebars');



lupa.analyze = function analyze (options) {

    var plugins;
    if (options.plugins) {
        // instantiate plugins from plugin names
        plugins = options.plugins.map(function (plugin) {
            return lupa.isString(plugin) ? lupa.plugins[plugin]() : plugin;
        });
    }

    function analyzeFile(filename) {
        var code = lupa.file(filename).read();
        return (plugins || lupa.pluginProvider(filename)).reduce(function (data, plugin) {
            _.assign(data, plugin(code));
            return data;
        }, {path: filename, name: lupa.mapFileToObject(filename)});
    }

    var data = options.files.map(analyzeFile);

    return {
        render: function render (templateName) {
            return lupa.view(templateName, data);
        },
        data: data
    };
};


// todo maybe file cache and lazy loading f.read. check if content is function etc.
// todo cache in function file.read

lupa.file = function (path_) {
    var f = File(path_);
    return f;
};




lupa.helpers = {
    parsePath: function (files, parser) {
        return glob.sync(files).map(lupa.file).map(function (file) {
            return file.analyze(parser);
        });
    }
};
