var esprima = require('esprima-fb');
var escodegen = require('escodegen-wallaby');

function typeFilter (type) {
    return function (node) {
        return node.type === type;
    }
}

function parseCommonJSExports (body, code) {
    var res = body
        .filter(typeFilter('ExpressionStatement'))
        .filter(function (node) {
            if (!node.expression.left) return false;
            //if (!node.expression.left.object) return false;
            if (!node.expression.left.property) return false;
            return node.expression.left.property.name == 'exports';
        })
        //.filter(function(node) {
        //    return node.expression.right.properties;
        //})
        .map(function (node) {
            var props = node.expression.right.properties;
            var exprType = node.expression.right.type;

            if (exprType== 'ObjectExpression')
                return props.map(function (prop) {
                    var res = (prop.key.name || prop.key.value); // TODO because of that.
                    //var res = (prop.value.type + '') + (prop.key.name || prop.key.value); // TODO because of that.
                    var range = prop.value.range;
                    var len = range[1] - range[0];
                    var raw;
                    if (range)
                        raw =  code.substr(range[0], len);
                    if (len > 80) {
                        raw = raw.substr(0,80) + '...';
                    }

                    //if (prop.value.raw) res += 'RAW' + prop.value.raw;
                    return {
                        name: res,
                        raw: raw,
                        astType: exprType
                    };
                });
            if (exprType== 'Identifier') {
                return [{
                    name: node.expression.right.name,
                    astType: exprType,
                    raw: ''
                }];
            }
        })
        .filter(function(node) {
            return node;
        });

    return res[0]; //TODO WTF why is array here?
}

function parseExports (body) {
    return body.filter(typeFilter('ExportDeclaration'))
        .map(function (node) {
            var decl = node.declaration;
            var out = {name: decl.id.name};
            if (decl.type === 'ClassDeclaration') {
                out.methods = decl.body.body.filter(typeFilter('MethodDefinition'))
                    .map(function (method) {
                        return {
                            name: method.key.name,
                            body: escodegen.generate(method.value.body)
                        };
                    });
            }
            out.type = {
                    'ClassDeclaration': 'class',
                }[node.declaration.type] || 'unknown';
            return out;
        });
}

module.exports = function () {
    return function (code, filename) {
        var ast = esprima.parse(code, {sourceType: 'module', range: true, raw: true});
        var body = ast.body;
        var es6imports = body.filter(function (node) {
            return node.type == 'ImportDeclaration';
        }).map(function (node) {
            return node.source.value;
        });

        var moduleExports = parseCommonJSExports(body, code);
        //throw 'ss';


        var requires = body.filter(function (node) {
            // TODO: this doesn't detect something like this:
            // var something = require('module')(somearguments);
            // only this:
            // var something = require('module');
            if (node.type !== 'VariableDeclaration')
                return false;
            var init = node.declarations[0].init;
            if (!init)
                return false;
            if (init.type != 'CallExpression')
                return false;
            if (init.callee.name != 'require')
                return false;
            return true;

        }).map(function (node) {
            return node.declarations[0].init.arguments[0].value;
        });


        var exports = parseExports(body);
        return {
            name: filename,
            es6imports: es6imports,
            requires: requires,
            imports: es6imports.concat(requires),
            exports: exports,
            moduleExports: moduleExports
        };
    };
};
