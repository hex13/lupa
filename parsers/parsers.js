var Path = require('path');

var parseHtml = require('html-flavors').parseHtml;
var DEBUG = false;

var jsParserOptions = require('./parserOptions')['.js'];


var parsers = {
    '.js': function (code) {
        var parser = require('acorn-jsx');
        return parser.parse(code, jsParserOptions);
    },
    '.html': function (code) {
        return parseHtml(code);
    }
};

function parse(file) {
    var path = file.path;
    var ext = Path.extname(path);
    if (parsers.hasOwnProperty(ext)) {
        try {
            var root = parsers[ext](file.contents + '');
        } catch(e) {
            if (DEBUG)
                console.error(e);
            return file;
        }

        //var body = root.program? root.program.body : root.body;
        //if (!body) throw 'Couldn\'t determine AST body';
        var ast = {
            type: 'ast',
            root: root,
            //body: body
        }
        var clone = {path: file.path, contents: file.contents};
        return Object.assign(clone, {ast: ast});
    }
    return file;
}

parse.jsParserOptions = jsParserOptions;
module.exports = parse;
