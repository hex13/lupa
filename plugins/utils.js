"use strict";

var resolve = require('resolve');
var Path = require('path');
var _ = require('lodash');

const cache = {
    files: new Map
};
exports.resolveModulePath = function resolveModulePath(parentFile, path) {
    let cached = cache.files.get(parentFile);
    if (cached) {
        if (cached.get(path)) {
            return cached.get(path);
        }
    } else {
        cached = new Map;
        cache.files.set(parentFile, cached);
    }
    try {
        const result = resolve.sync(path, {
            basedir: Path.dirname(parentFile),
            extensions: [ '.js', '.coffee' ],
        });
        cached.set(path, result);
        return result;
    } catch(e) {
        //console.log("RESOLVING ERROR", parentFile, path);
        return path;
    }
}

exports.objectExpressionToJS = function objectExpressionToJS (node) {
    function getPropertyName(node) {
        return getName(node.key);//.name;
    }
    function getPropertyValue(node) {
        if (node.value && node.value.type == 'ObjectExpression')
            return objectExpressionToJS(node.value);
        return (node.value && node.value.value) || '???';
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
    if (!node) {
        return '';
    }
    // for Recast path objects
    if (node.node)
        return getName(node.node);

    if (_.isString(node))
        return node;
    if (node.key) return getName(node.key);
    if (node.name) return getName(node.name);
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
    if (node.elements) {
        return node.elements.map(getName);
    }
    if (node.specifiers) {
        if (node.specifiers.length == 1) {
            return getName(node.specifiers[0]);
        }
        return node.specifiers.map(getName);
    }

    if (node.expression) {
        return getName(node.expression);
    }
    if (node.value) {
        return node.value;
    }
    if (node.object && node.property) {
        return getName(node.object) + '.' + getName(node.property);
    }
    if (node.local) {
        return getName(node.local);
    }
    if (node.left) {
        return getName(node.left);
    }
    return '';
}
exports.getName = getName;

exports.analyzeChain = function analyze (node) {
    if (node.expression) {
        return analyze(node.expression);
    }
    var line = node.loc && node.loc.start.line;
    //console.log('LOC', node, line);
    switch (node.type) {
        case 'CallExpression':
            var args = node.arguments
                .map(a => [
                    {
                        value: getName(a),
                        loc: a.loc
                    }
                ])
                //.map(analyze)
                .reduce(function(res, arg) {
                    return res.concat(arg);
                }, []);
            var chain = analyze(node.callee);
            chain[chain.length - 1] = _.assign(
                {},
                chain[chain.length - 1],
                // arguments property can be read only (set by parser)
                // so we assign object
                {arguments: args}
            );
            return chain;
            break;
        case 'MemberExpression':
            return analyze(node.object).concat(analyze(node.property));
            break;
        case 'Identifier':
            return [{
                name: node.name,
                loc: node.loc
            }];
        default:
            return [getName(node)];
    }
    return [];

}

function unwrapIIFEs(body) {
    return body.reduce(function (acc, node) {
        if (
            // check if node is IIFE:
            node.expression &&
            node.expression.type == 'CallExpression' &&
            node.expression.callee.type == 'FunctionExpression'
        ) {
            return acc.concat(node.expression.callee.body.body);
        }
        return acc.concat(node);
    }, [])

}

module.exports.unwrapIIFEs = unwrapIIFEs;


function getAngularInfoFromChains(chains) {
    var directives = [];
    var modules = [];
    var services = [], values = [], factories = [], controllers = [];

    var allowedEntityNames = ['directive', 'service', 'value', 'factory', 'controller'];
    var entities = {

    };
    var metadataForEntities = [];

    var deps = [];
    chains.forEach(function (chain) {
        chain.forEach(function (part) {

            if (allowedEntityNames.indexOf(part.name) != -1 && part.arguments) {
                const args = part.arguments;
                const loc = (args[1] && args[1].loc) || (args[0] && args[0].loc);
                const name = (args[0] && args[0].value) || '';
                metadataForEntities.push({
                    type: part.name,
                    name: name,
                    loc: loc,
                });
            }

            if (part.name == 'module' && part.arguments) {
                modules.push({
                    type: 'angularModule',
                    name: part.arguments[0].value,
                    loc: part.loc
                });
                if (part.arguments.length >= 2) {
                    deps.push.apply(deps, part.arguments[1].value);

                    // deps.push.apply(
                    //     deps, part.arguments[1].map(function(dep) {
                    //         return {name: 'dependencies', data: dep}
                    //     })
                    // );
                }
            }
        });
    });

    const metadataForModuleDeps = deps.map(function (dep) {
        return {
            type: 'angularModuleDependency',
            name: dep
        }
    });

    return [
        //{name: 'modules', data: modules, legacy: true},
        //{name: 'dependencies', data: deps, legacy: true}
    ].concat(metadataForEntities)
        .concat(modules)
        .concat(metadataForModuleDeps);
}

exports.getAngularInfoFromChains = getAngularInfoFromChains;

function closest(node) {

}

exports.closest = closest;


exports.sameLoc = function sameLoc(a, b) {
    return (
        a.start.line === b.start.line &&
        a.start.column === b.start.column &&
        a.end.line === b.end.line &&
        a.end.column === b.end.column
    );
}
