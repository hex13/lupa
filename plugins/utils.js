exports.objectExpressionToJS = function objectExpressionToJS (node) {
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

    if (node.expression) {
        return getName(node.expression);
    }
    if (node.value) {
        return node.value;
    }

}
exports.getName = getName;

exports.analyzeChain = function analyze (node) {
    if (node.expression) {
        return analyze(node.expression);
    }
    switch (node.type) {
        case 'CallExpression':
            var args = node.arguments
                .map(analyze)
                .reduce(function(res, arg) {
                    return res.concat(arg);
                }, []);
            var chain = analyze(node.callee);
            chain[chain.length - 1] = {
                name: chain[chain.length - 1],
                arguments: args
            };
            return chain;
            break;
        case 'MemberExpression':
            return analyze(node.object).concat(analyze(node.property));
            break;
        case 'ArrayExpression':
            return [node.elements.reduce(function (arr, arg) {
                return arr.concat(analyze(arg));
            }, [])];
        case 'Identifier':
            return [node.name];
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
    var services = [], values = [], factories = [];
    var deps = [];
    chains.forEach(function (chain) {
        chain.forEach(function (part) {
            if (part.name == 'directive' && part.arguments) {
                directives.push(part.arguments[0]);
            }
            if (part.name == 'service' && part.arguments) {
                services.push(part.arguments[0]);
            }
            if (part.name == 'value' && part.arguments) {
                values.push(part.arguments[0]);
            }
            if (part.name == 'factory' && part.arguments) {
                factories.push(part.arguments[0]);
            }            

            if (part.name == 'module' && part.arguments) {
                modules.push(part.arguments[0]);
                if (part.arguments.length >= 2) {
                    deps.push.apply(deps, part.arguments[1]);
                    // deps.push.apply(
                    //     deps, part.arguments[1].map(function(dep) {
                    //         return {name: 'dependencies', data: dep}
                    //     })
                    // );
                }
            }
        });
    });
    console.log('DEPS',deps);
    var entityTypes = ['directive', 'module'];
    return [
        {name: 'modules', data: modules},
        {name: 'dependencies', data: deps},
        {name: 'directives', data: directives},
        {name: 'services', data: services},
        {name: 'values', data: values},
        {name: 'factories', data: factories},
    ];
    console.log(metadata);
    return {
        directives: directives,
        modules: modules,
        deps: deps
    }
}

exports.getAngularInfoFromChains = getAngularInfoFromChains;
