var glob = require('glob');
var fs = require('fs');

var _ = require('lodash');

var Q = require('q');
var Handlebars = require('handlebars');



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
        return plugins.map(function readFiles(plugin) {
                return files.map(plugin.readFile.bind(plugin, fs));
            })
            .map(function convertListToDictionary (dataFromPlugin) {
                return _.indexBy(dataFromPlugin, 'file');
            })
            .reduce(function mergeChunks (outputDictionary, chunk) {
                return _.merge(outputDictionary, chunk);
            }, {});
    },
    plugins: require('./plugins'),
    fileNames: require('./fileNames'),
    fileNames2: require('./fileNames2'),
    View: require('./views/View.js')
};

lupa.view = lupa.View();
lupa.view.registerTemplateEngine('handlebars', function (tpl) {
    return Handlebars.compile(tpl);
});

lupa.view.registerTemplate('urls', 'urls.html.handlebars');


lupa.file = function (path_) {
    return {
        path: path_,
        read: function () {
            return fs.readFileSync(path_, 'utf8');
        },
        analyze: function (plugin) {
            if (Object.prototype.toString.call(plugin) == '[object String]') {
                plugin = lupa.plugins[plugin]();
            }
            var code = this.read();
            var data = plugin(code);
            return {
                render: function (templateName) {
                    return lupa.view(templateName, data);
                },
                data: data
            };
        }
    };
};