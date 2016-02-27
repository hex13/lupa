var c = 0;
var recast = require('recast');
var log = console.log.bind(console);
var die = function () {
    console.error([].slice.call(arguments));
    throw '';
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

module.exports = {
    getComponents: function (file, enc, cb) {
        var ast = file.ast;
        var classes = [];

        recast.visit(ast, {
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
        clone.metadata = [{
            'name': 'classes', data: classes
        }];
        cb(null, clone);
    }
}
