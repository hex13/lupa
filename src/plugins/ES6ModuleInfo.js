var esprima = require('esprima-fb');

module.exports = function () {
    return function (code, filename) {
        var ast = esprima.parse(code, {sourceType: 'module'});
        var body = ast.body;
        var imports = body.filter(function (node) {
            return node.type == 'ImportDeclaration';
        }).map(function (node) {
            return node.source.value;
        });
        return {
            name: filename,
            imports: imports
        };
    };
};
