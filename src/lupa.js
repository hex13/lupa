var glob = require('glob');
var fs = require('fs');
var _ = require('lodash');
var Q = require('q');
var Handlebars = require('handlebars');
var File = require('./file');


var lupa = module.exports = {
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
