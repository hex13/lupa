"use strict";

var recast = require('recast');


var utils = require('./utils');
var addMetadata = require('../src/metadata').addMetadata;
var objectExpressionToJS = utils.objectExpressionToJS;
var getName = utils.getName;
var unwrapIIFEs = utils.unwrapIIFEs;
var getAngularInfoFromChains = utils.getAngularInfoFromChains;
var sameLoc = utils.sameLoc;


var log = console.log.bind(console);
var die = function () {
    console.error([].slice.call(arguments));
    throw '';
}


var resolveModulePath = utils.resolveModulePath;



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
    if (!expr.object) {
        console.log("ERROR: !expr.object;  expr===", expr);
    }

    switch (expr.object.type) {
        case 'Identifier':
            left = named(getName(expr.object));
            break;
        case 'MemberExpression':
            left = solveMemberExpression(expr.object);
            break;
        case 'CallExpression':
            left = named(getName(expr.object.callee));//solveMemberExpression(expr.object.callee);
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

            return false;
        }
    });

    return false;
}


module.exports = function (config) {

    function getComponents (file, enc, cb) {



        function analyzeFunction (path){
            let jsx = false;
            let name = getName(path.node);
            let argumentOf = '';

            const parent = path.parent.node;

            if (!name) {
                const key = path.parent.node.key;
                if (key)
                    name = getName(key);
            }

            if (!name) {
                if (parent) {
                    name = getName(parent);
                }
            }

            if (parent) {
                if (parent.callee) {
                    argumentOf = getName(parent.callee);
                }
            }

            // to strip namespace from function name
            // if function name is `a.b.foo`, get `foo`
            name = (name + '').split('.').pop();

            function findParentClassDeclaration(path) {
                if (path.node.type == 'ClassDeclaration') {
                    return path.node;
                }
                if (path.parent) {
                    return findParentClassDeclaration(path.parent);
                }
                return null;
            }

            let parentClass = null;
            const cls = findParentClassDeclaration(path);
            if (cls) {
                parentClass = {
                    name: getName(cls),
                    loc: cls.loc,
                }
            }

            recast.visit(path, {
                visitJSXElement: function (path) {
                    jsx = true;
                    return false;
                }
            });

            functions.push({
                type: 'function',
                loc: path.node.loc,
                name: name,
                parentClass: parentClass,
                argumentOf: {name: argumentOf},
                isMethod: path.parent.node.type == 'MethodDefinition',
                jsx: jsx,
                params: path.node.params.map(param => {
                    const name = getName(param);
                    if (name) {
                        return {name};
                    }
                    if (param.type == 'ObjectPattern') {
                        const destructuredParams = Object.keys(objectExpressionToJS(param));
                        return {
                            name: '{' + destructuredParams.join(', ') +'}'
                        }
                    }
                    return {
                        name: '???'
                    }

                })
            });
            this.traverse(path);
        }


        var ast = file.ast && file.ast.root;
        if (!ast) {
            cb(null, file);
            return;
        }

        var classes = [], imports = [], exports = [],
        functions = [], metadata = [], directives = [],
        modules = [],  dependencies = [], objectLiterals = [], variables = [];
        0 && console.log(
            ast.body.map(
                function(n){ return n.type}
            )
        );

        var chains = unwrapIIFEs(ast.body)
            .map(utils.analyzeChain);

        var angularMetadata = [];
        angularMetadata = getAngularInfoFromChains(chains);

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

        var cssClasses = [];
        var jsxElements = [];

        function visitExportDeclaration(path) {
            const node = path.node;
            exports.push({
                type: 'export',
                name: getName(node),
                loc: node.loc
            });
            this.traverse(path);
        }

        recast.visit(ast, {
            visitObjectExpression: function (path) {
                const node = path.node;
                objectLiterals.push({
                    type: 'objectLiteral',
                    name: getName(path.parent.node),
                    loc: node.loc,
                    props: objectExpressionToJS(node),
                });
                this.traverse(path);
            },
            visitJSXOpeningElement: function (path) {
                const node = path.node;
                const name = getName(node.name);
                if (name &&
                    (
                        name.charAt(0) == name.charAt(0).toUpperCase()
                        || name.indexOf('.') != -1
                    )
                ) {
                    jsxElements.push({
                        type: 'jsxCustomElement',
                        name: name,
                        loc: node.loc,
                    })
                }
                this.traverse(path);
            },
            visitJSXAttribute: function (path) {
                const node = path.node;

                if (
                    getName(node.name) === 'className'
                    && node.value && node.value.type == 'Literal'
                ) {
                    const className = getName(node.value);
                    cssClasses.push.apply(cssClasses,
                        className.split(' ').map( cls => ({
                            type: 'cssClass',
                            name: cls,
                            loc: node.loc,
                        }))
                    );
                }
                this.traverse(path);
            },
            visitVariableDeclaration: function(path) {

                function closest(path, type) {
                    if (path.node.type === type)
                        return path;
                    if (path.parent)
                        return closest(path.parent, type);
                }


                var node = path.node;

                node.declarations.forEach(function(decl) {
                    // TODO
                    // 1. not all functions are FunctionDeclaration
                    // 2. not all variables are function scoped (const and let aren't)
                    const closestFunction = closest(path, 'FunctionDeclaration');
                    let scope;
                    if (closestFunction) {
                        scope = {
                            loc: closestFunction.node.loc
                        }
                    }
                    variables.push({
                        type: 'variableDeclaration',
                        name: getName(decl),
                        init: recast.print(decl.init).code,
                        loc: decl.loc,
                        scope: scope
                    });


                    var init;
                    if (
                        decl.init
                        && decl.init.type == 'MemberExpression'
                        && decl.init.object.type == 'CallExpression'
                    ) {
                        init = decl.init.object;
                    } else {
                        init = decl.init;
                    }

                    if (init) {
                        if (
                            init.type == 'CallExpression'
                            && init.arguments.length
                            && getName(init.callee) == 'require'
                        ) {
                            var originalSource = getName(init.arguments[0]) + ''; // coerce to string;
                            var obj = {
                                type: 'import',
                                name: getName(decl),
                                originalSource: originalSource,
                                loc: node.loc,
                                source: resolveModulePath(file.path, originalSource)
                            };
                            imports.push(obj);
                        }
                    }

                });

                this.traverse(path);
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
                var originalSourceName = getName(node.source);
                var modulePath = resolveModulePath(file.path, originalSourceName);

                if (name.substr)
                    imports.push({
                        type: 'import',
                        name: name,
                        source: modulePath,
                        loc: node.loc,
                        originalSource: originalSourceName
                    });
                else if (name.forEach) {
                    name.forEach(function (n) {
                        imports.push({
                            type: 'import',
                            name: n,
                            source: modulePath,
                            loc: node.loc,
                            originalSource: originalSourceName
                        })
                    })
                }

                this.traverse(path);
            },
            visitExportDeclaration: visitExportDeclaration,
            visitExportNamedDeclaration: visitExportDeclaration,
            visitExportDefaultDeclaration: visitExportDeclaration,
            visitFunctionExpression: analyzeFunction,

            visitFunctionDeclaration: analyzeFunction,
            visitArrowFunctionExpression: analyzeFunction,
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
                        case 'MemberExpression': {


                            const name = getName(left.object);
                            if (name === 'exports') {
                                exports.push({
                                    type: 'export',
                                    name: getName(left.property),
                                    loc: node.loc
                                });
                            }

                            if (getName(left) === 'module.exports') {
                                let exportNames;
                                switch (right.type) {
                                    case 'ObjectExpression':
                                        var obj = objectExpressionToJS(right);
                                        exportNames = Object.keys(obj);
                                        exportNames.forEach(name => {
                                            exports.push({
                                                type: 'export',
                                                name: name,
                                                loc: right.loc
                                            });
                                        });

                                        break;
                                    default:
                                        exports.push({
                                            type: 'export',
                                            name: getName(right),
                                            loc: right.loc
                                        });
                                        break;
                                }

                            }

                            var solved = solveMemberExpression(left);
                            var searched = ['module', 'exports'];
                            var found = solved.filter(function (part, i) {
                                return part.name !== searched[i];
                            }).length === 0;
                            if (found) {
                                // here was legacy code.
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
                        }
                        default:
                    }
                }
                this.traverse(path);
            },
            visitClassDeclaration: function (path) {
                var node = path.node;
                var classBody = node.body.body;
                var cls = {
                    type: 'class',
                    name: getName(node),
                    superClass: {
                        name: getName(node.superClass)
                    },
                    loc: node.loc,
                    // functions: classBody.map(function (meth) {
                    //     return {name: getName(meth.key)};
                    // })
                }
                classes.push(cls);
                this.traverse(path);
            },
        })

        var providesModule = file.contents.toString().match(/@providesModule +(\w+)/) || [];
        classes.forEach(function (cls) {
            const funcs = functions.filter(function doesFunctionBelongToClass(f) {
                const parent = f.parentClass;
                if (!parent) {
                    return false;
                }

                return parent.name === cls.name &&
                    parent.loc.start.line === cls.loc.start.line &&
                    parent.loc.start.column === cls.loc.start.column;
            });
            cls.functions = funcs;
        });

        variables.forEach(function reassignScope (variable) {
            if (variable.scope) {
                const scopeWithFullInfo = functions.find(f => sameLoc(f.loc, variable.scope.loc));
                variable.scope = scopeWithFullInfo;

                if (!scopeWithFullInfo.vars) scopeWithFullInfo.vars = [];
                scopeWithFullInfo.vars.push(variable);
            }
        });

        if (providesModule) {
            metadata.push({
                type: 'providesModule',
                data: [providesModule[1]]
            });
        }
        var finalMetadata = metadata
        .concat([
            {
                'type': 'exports', data: exports.map(item => item.name)
            },
        ])
        .concat(
            angularMetadata, imports, classes, functions, objectLiterals, variables, cssClasses, jsxElements, exports);
        var clone = addMetadata(file, finalMetadata);

        cb(null, clone);
    }
    return getComponents;
}
