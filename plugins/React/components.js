var c = 0;
var recast = require('recast');

var utils = require('../utils');
var objectExpressionToJS = utils.objectExpressionToJS;
var getName = utils.getName;

var log = console.log.bind(console);
var die = function () {
    console.error([].slice.call(arguments));
    throw '';
}


function solveMemberExpression (expr) {
    var left = [], right = [];

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
    // if (expr.computed)
    //     return left + '[' + right + ']';
    return left.concat(right);
}


function checkAngular(path) {
    recast.visit(path.node, {
        visitMemberExpression: function(path) {
            var prop = path.node.property;
            var obj = path.node.object;
            var chain = solveMemberExpression(path.node);
            var directives = chain.filter(function (method) {
                return method.name == 'directive';
            }).map(function (method) {
                return method.arguments[0]
            });
            console.log("expr", chain);
            console.log("directives", directives);

            return false;
        }
    });

    return false;
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
            // angular directive
            // visitExpressionStatement: function (path) {
            // },

            visitExpressionStatement: function (path) {
                checkAngular(path);
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
                            var searched = ['module', 'exports'];
                            var found = solved.filter(function (part, i) {
                                return part.name !== searched[i];
                            }).length === 0;
                            if (found) {
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
