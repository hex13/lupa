var fs = require('fs');
var join = require('path').join;
var extname = require('path').extname;


function View () {
    var templates = {};
    var templateEngines = {};

    var view = function(templateName, data) {
        var render = templates['tpl_' + templateName];
        if (!(render instanceof Function)) {
            throw 'Template not found: ' + templateName;
        }
        return render(data);
    };

    view.registerTemplateEngine = function (templateEngineName, compile) {
        templateEngines['tplEngine_' + templateEngineName] = compile;
    };

    view.registerTemplate = function (templateName, path) {
        var tpl = fs.readFileSync(join(__dirname, 'templates', path), 'utf8');
        var ext =  extname(path).substring(1);
        templates['tpl_' + templateName] = templateEngines['tplEngine_' + ext](tpl);
    };

    return view;
}



module.exports = View;