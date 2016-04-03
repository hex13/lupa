var Path = require('path');

var parseHtml = require('html-flavors').parseHtml;

var parsers = {
    '.js': function (code) {
        var parser = require('flow-parser');
        return parser.parse(code, {});
    },
    '.html': function (code) {
        console.log("AAAAAAA H*T*M*")
        return parseHtml(code);
    }
};

function parse(file) {
    var path = file.path;
    var ext = Path.extname(path);
    if (parsers.hasOwnProperty(ext)) {
        var root = parsers[ext](file.contents + '');

        //var body = root.program? root.program.body : root.body;
        //if (!body) throw 'Couldn\'t determine AST body';
        var ast = {
            type: 'ast',
            root: root,
            //body: body
        }
        var clone = file.clone();
        return Object.assign(clone, {ast: ast});
    }
    return file;
}

module.exports = parse;
