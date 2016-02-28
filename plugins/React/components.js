var c = 0;
var recast = require('recast');
var log = console.log.bind(console);
var die = function () {
    console.error([].slice.call(arguments));
    throw '';
}

function objectExpressionToJS (node) {
    function getPropertyName(node) {
        return node.key.name;
    }
    function getPropertyValue(node) {
        return node.value.value;
    }
    var names = node.properties.map(function (node) {
        return {
            name: getPropertyName(node),
            value: getPropertyValue(node)
        }
    });
    var obj = {};
    names.forEach(function (item) { obj[item.name] = item.value; });
    return obj;
}

function getName(node) {
    if (node.name) return node.name;
    if (node.id) return getName(node.id);
    if (node.declarations) {
        if (node.declarations.length == 1) {
            return getName(node.declarations[0]);
        }
        return node.declarations.map(getName).join(', ');
    }
    if (node.declaration) {
        return getName(node.declaration);
    }
    if (node.specifiers) {
        if (node.specifiers.length == 1) {
            return getName(node.specifiers[0]);
        }
        return node.specifiers.map(getName).join(', ');
    }

}

function solveMemberExpression (expr) {
    var left = '???', right = '???';

    function str(chain) {
        if (chain.map)
        return chain.map(function (link) {
            if (link.type == 'call')
                return link.name + '(' + link.arguments.join(', ') + ')'
            return link.name;
        }).join('.')
        return []
    }
    function named(name) {
        var obj =  {
            name: name
        }
        obj.toString = function () { return '::'+name+'; ';};
        return [obj];
    }


    switch (expr.object.type) {
        case 'Identifier':
            left = named(getName(expr.object));
            break;
        case 'MemberExpression':
            left = solveMemberExpression(expr.object);
            break;
        case 'CallExpression':
            var left = solveMemberExpression(expr.object.callee);
            var last = left[left.length - 1];
            last.type = 'call';
            last.arguments = expr.object.arguments.map(getName);
            break;
    }

    if (expr.property.type == 'Identifier') {
        right = named(getName(expr.property));
    }
    if (expr.computed)
        return left + '[' + right + ']';
    return left.concat(right);
}

module.exports = {
    getComponents: function (file, enc, cb) {
        test = 1245;
        var ast = file.ast;
        var classes = [], imports = [], exports = [], functions = [], metadata = [];
        0 && console.log(
            ast.program.body.map(
                function(n){ return n.type}
            )
        );

        ast.program.body.forEach(function (node) {
        });
        //throw 'd'

        recast.visit(ast, {
            visitImportDeclaration: function (path) {
                var node = path.node;
                imports.push(getName(node));
                this.traverse(path);
            },
            visitExportDeclaration: function (path) {
                exports.push(getName(path.node));
                this.traverse(path);
            },
            visitFunctionDeclaration: function (path) {
                functions.push(getName(path.node));
                this.traverse(path);
            },
            // visitExpressionStatement: function (path) {
            //     recast.visit(path.node, {
            //         visitMemberExpression: function(path) {
            //             var prop = path.node.property;
            //             var obj = path.node.object;
            //             console.log("expr", solveMemberExpression(path.node));
            //
            //             return false;
            //         }
            //     });
            //
            //     return false;
            // },
            //
            visitExpressionStatement: function (path) {
                //.push(getName(path.node));
                //console.log(path);
                //this.traverse(path);
                var node = path.node;
                if (node.expression.type == 'AssignmentExpression') {
                    var left = node.expression.left;
                    var right = node.expression.right;
                    switch (left.type) {
                        case 'Identifier':
                            console.log("identifier", getName(left));
                            break;
                        case 'MemberExpression':
                            var solved = solveMemberExpression(left);

                            if (solved == 'module.exports') {
                                var exports = [];
                                switch (right.type) {
                                    case 'ObjectExpression':
                                        var obj = objectExpressionToJS(right);
                                        exports = Object.keys(obj);
                                        break;
                                    case 'Identifier':
                                        exports = [getName(right)];
                                }

                                metadata.push({
                                    name: 'module.exports',
                                    data: exports
                                });
                            }

                            break;
                        default:
                    }
                    recast.visit(node.expression.left, {
                        visitIdentifier: function(path) {
                            console.log('id',getName(path.node));
                            return false;
                        }
                    });
                }
                return false;
            },
            visitClassDeclaration: function (path) {
                console.log("klasa");
                var node = path.node;
                var classBody = node.body.body;
                var cls = {
                    name: getName(node),
                    methods: classBody.map(function (meth) {
                        return getName(meth.key);
                    })
                }
                classes.push(cls);
                this.traverse(path);
            },
        })

        var clone = file.clone();
        clone.metadata = metadata.concat([
            {
                'name': 'imports', data: imports
            },
            {
                'name': 'exports', data: exports
            },
            {
                'name': 'classes', data: classes
            },
            {
                'name': 'functions', data: functions
            },
        ]);
        cb(null, clone);
    }
}
