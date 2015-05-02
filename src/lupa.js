var glob = require('glob');
var fs = require('fs');

var _ = require('lodash');

var Q = require('q');
var Handlebars = require('handlebars');

var File = require('./file');

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
        var cache = files.reduce(function (dict, file) {
            dict['f@' + file] = fs.readFileSync(file, 'utf8');
            return dict;
        }, {});


        return plugins.map(function readFiles(plugin) {
                return files.map(function (file) {
                        return (plugin.readFile || plugin).call(plugin, fs, file, cache['f@' + file]);
                    }
                );
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
    var f = File(path_);
    f.analyze = function (plugin) {
        if (Object.prototype.toString.call(plugin) == '[object String]') {
            plugin = lupa.plugins[plugin]();
        }
        var code = this.read();
        var data = plugin(code);
        return {
            path: path_,
            render: function (templateName) {
                return lupa.view(templateName, data);
            },
            data: data
        };
    };
    return f;
};




lupa.helpers = {
    parsePath: function (files, parser) {
        return glob.sync(files).map(lupa.file).map(function (file) {
            return file.analyze(parser);
        });
    }
};
