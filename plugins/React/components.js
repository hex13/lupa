var c = 0;
var recast = require('recast');

var utils = require('../utils');
var Path = require('path');
var objectExpressionToJS = utils.objectExpressionToJS;
var getName = utils.getName;
var unwrapIIFEs = utils.unwrapIIFEs;
var getAngularInfoFromChains = utils.getAngularInfoFromChains;

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
        var ast = file.ast.root;
        var classes = [], imports = [], exports = [],
        functions = [], metadata = file.metadata || [], directives = [],
        modules = [],  dependencies = [];
        0 && console.log(
            ast.body.map(
                function(n){ return n.type}
            )
        );

        var chains = unwrapIIFEs(ast.body)
            .map(utils.analyzeChain);

        var angularMetadata = [];
        var angularMetadata = getAngularInfoFromChains(chains);
        console.log("result from getAngularInfoFromChains", angularMetadata);

        recast.visit(ast, {
            visitImportDeclaration: function (path) {
                var node = path.node;
                var name = getName(node);
                function resolveModulePath(parentFile, path) {
                    if (path.indexOf('.') != 0) {
                        return path;
                    }
                    var absolutePath = Path.resolve(Path.dirname(parentFile), path);

                    // TODO this is naive approach.
                    // What about require('./Whatever'), when ./Whatever is directory
                    // which contains file index.js in it?
                    // We can't assume that lack of extension == absolutePath + '.js'
                    return Path.extname(absolutePath)? absolutePath : absolutePath + '.js';
                }
                console.log('visitImportDeclaration 2016', node, "its name", getName(node.source));
                //console.log(' 2016 -- path', file.path);
                var originalSourceName = getName(node.source);
                var modulePath = resolveModulePath(file.path, originalSourceName);
                if (name.substr)
                    imports.push({
                        name: name,
                        source: modulePath,
                        originalSource: originalSourceName
                    });
                else if (name.forEach) {
                    name.forEach(function (n) {
                        imports.push({
                            name: n,
                            source: modulePath,
                            originalSource: originalSourceName
                        })
                    })
                }
                console.log("Imporciki", imports);
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
                //checkAngular(path);
                //.push(getName(path.node));
                //console.log(path);
                //this.traverse(path);
                var node = path.node;
                if (node.expression.type == 'AssignmentExpression') {
                    var left = node.expression.left;
                    var right = node.expression.right;
                    switch (left.type) {
                        case 'Identifier':
                            //console.log("identifier", getName(left));
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
                            //console.log('id',getName(path.node));
                            return false;
                        }
                    });
                }
                return false;
            },
            visitClassDeclaration: function (path) {
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
                'name': 'rnd', data: Math.random() * 10000
            },
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
        ]).concat(dependencies.map(function(depList) {
            return {
                name: 'dependencies', data: depList
            }
        })).concat(
            angularMetadata
        );
        console.log('XXXXX',JSON.stringify(angularMetadata));
        cb(null, clone);
    }
}
