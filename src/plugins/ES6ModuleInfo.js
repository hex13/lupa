var esprima = require('esprima-fb');

module.exports = function () {
    return function (code, filename) {
        var ast = esprima.parse(code, {sourceType: 'module'});
        var body = ast.body;
        var es6imports = body.filter(function (node) {
            return node.type == 'ImportDeclaration';
        }).map(function (node) {
            return node.source.value;
        });
        var requires = body.filter(function (node) {
            // TODO: this doesn't detect something like this:
            // var something = require('module')(somearguments);
            // only this:
            // var something = require('module');
            if (node.type !== 'VariableDeclaration')
                return false;
            var init = node.declarations[0].init;
            if (init.type != 'CallExpression')
                return false;
            if (init.callee.name != 'require')
                return false;
            return true;

        }).map(function (node) {
            return node.declarations[0].init.arguments[0].value;
        });
        return {
            name: filename,
            es6imports: es6imports,
            requires: requires,
            imports: es6imports.concat(requires)
        };
    };
};
