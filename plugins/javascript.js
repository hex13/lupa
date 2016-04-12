var c = 0;
var recast = require('recast');

var utils = require('./utils');
var helpers = require('../src/helpers');
var addMetadata = require('../src/metadata').addMetadata;
var Path = require('path');
var fs = require('fs');
var objectExpressionToJS = utils.objectExpressionToJS;
var getName = utils.getName;
var unwrapIIFEs = utils.unwrapIIFEs;
var getAngularInfoFromChains = utils.getAngularInfoFromChains;

var log = console.log.bind(console);
var die = function () {
    console.error([].slice.call(arguments));
    throw '';
}


function resolveModulePath(parentFile, path) {
    if (path.indexOf('.') != 0) {
        try {
            var nodeModules = helpers.findInParentDirectories(Path.dirname(parentFile), 'node_modules');
            if (!nodeModules) throw 'can\'t find node_modules';

            pathParts = path.split(Path.sep);
            var dir = pathParts.shift();

            var packageDir = Path.join(nodeModules, dir);
            var packageJson = Path.join(packageDir, 'package.json');
            var config = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
            var main = pathParts.length? Path.join.apply(Path, pathParts) : config.main;
            console.log("RESOLVE MAIN");
            if (Path.extname(main) == '')
                main += '.js';
            return Path.join(packageDir, main);
        } catch(e) {
            console.log("ERROR in resolveModulePath()", e)
            return path;
        }
    }
    var absolutePath = Path.resolve(Path.dirname(parentFile), path);

    // TODO this is naive approach.
    // What about require('./Whatever'), when ./Whatever is directory
    // which contains file index.js in it?
    // We can't assume that lack of extension == absolutePath + '.js'
    return Path.extname(absolutePath)? absolutePath : absolutePath + '.js';
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
        obj.toString = function () { return name;};
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


module.exports = function (config) {

    function getComponents (file, enc, cb) {
        test = 1245;
        var ast = file.ast.root;

        var classes = [], imports = [], exports = [],
        functions = [], metadata = [], directives = [],
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

        var namespacedSymbols = file.contents.toString().match(/\w+(\.\w+)+/g) || [];
        metadata.push.apply(metadata, namespacedSymbols
            .filter(n => {
                var first = n.substr(0, n.indexOf('.'));
                return config.namespaces.indexOf(first) != -1;
            })
            // only unique symbols (it can change in the future versions)
            .reduce( (res, symbol) => (
                res.indexOf(symbol) != -1? res : res.concat(symbol)
            ), [])
            .map(n => ({
                type: 'symbol',
                data: [n]
            }))
        )


        recast.visit(ast, {
            visitVariableDeclaration: function(path) {
                var node = path.node;
                node.declarations.forEach(function(decl) {
                    var init = decl.init;
                    if (init) {
                        if (init.type == 'CallExpression' && getName(init.callee) == 'require') {
                            var originalSource = getName(init.arguments[0]);
                            var obj = {
                                name: getName(decl),
                                originalSource: originalSource,
                                source: resolveModulePath(file.path, originalSource)
                            };
                            console.log("VARIABLE", obj);
                            imports.push(obj);
                        }
                    }

                });

                return false;
                //     var init = node.declarations[0].init;
                //     if (!init)
                //         return false;
                //     if (init.type != 'CallExpression')
                //         return false;
                //     if (init.callee.name != 'require')
                //         return false;
                //     return true;
                //
                // }).map(function (node) {
                //     return node.declarations[0].init.arguments[0].value;
                // });
                //
            },
            visitImportDeclaration: function (path) {
                var node = path.node;
                var name = getName(node);
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
                functions.push({
                    type: 'function',
                    loc: path.node.loc,
                    name: getName(path.node)
                });
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
                            } else if (path.parent.name == 'root'){
                                metadata.push({
                                    type: 'declaration',
                                    loc: path.node.loc,
                                    data: solved.join('.'),
                                    // name: solved.slice(0, -1).join('.'),
                                    // data: [solved[solved.length - 1]]
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
                    loc: node.loc,
                    methods: classBody.map(function (meth) {
                        return getName(meth.key);
                    })
                }
                classes.push(cls);
                this.traverse(path);
            },
        })

        var providesModule = file.contents.toString().match(/@providesModule +(\w+)/) || [];
        if (providesModule) {
            metadata.push({
                type: 'providesModule',
                data: [providesModule[1]]
            });
        }
        var finalMetadata = metadata.concat([
            {
                'type': 'rnd', data: Math.random() * 10000
            },
            {
                'type': 'imports', data: imports
            },
            {
                'type': 'exports', data: exports
            },
            {
                'type': 'classes', data: classes
            },
            {
                'type': 'functions', data: functions
            },
        ]).concat(dependencies.map(function(depList) {
            return {
                type: 'dependencies', data: depList
            }
        })).concat(
            angularMetadata
        );
        var clone = addMetadata(file, finalMetadata);

        cb(null, clone);
    }
    return getComponents;
}
