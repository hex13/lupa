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
        return node.specifiers.map(getName);
    }

    if (node.expression) {
        return getName(node.expression);
    }
    if (node.value) {
        return node.value;
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
    var services = [], values = [], factories = [], controllers = [];

    var allowedEntityNames = ['directive', 'service', 'value', 'factory', 'controller'];
    var pluralNames = {
        factory: 'factories',
    }
    var entities = {

    };

    var deps = [];
    chains.forEach(function (chain) {
        chain.forEach(function (part) {

            if (allowedEntityNames.indexOf(part.name) != -1 && part.arguments) {
                var pluralName = pluralNames.hasOwnProperty(part.name)?
                    pluralNames[part.name]
                    : part.name + 's';
                entities[pluralName] = entities[pluralName] || [];
                entities[pluralName].push(part.arguments[0]);
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

    var metadataForEntities = [];
    for (var ent in entities) {
        metadataForEntities.push({
            name: ent,
            data: entities[ent]
        });
    }

    return [
        {name: 'modules', data: modules},
        {name: 'dependencies', data: deps}
    ].concat(metadataForEntities);
}

exports.getAngularInfoFromChains = getAngularInfoFromChains;
