
Lupa 0.0.50
====

Lupa is plugin based analyser for JavaScript projects.

It's based on virtual file streams (like in Gulp).

`npm install --save lupa`

**Project is still under development and API is unstable. It's not production ready yet. But keep watching **

You can leave your suggestions [here](https://github.com/hex13/lupa/issues)

But one second. What is this all about? Well, overall workflow is like this:

1. `vinyl-fs` library: read content of the file(s) with source code (html, css, js, sass etc.)
2. `ast-stream` library: parse files to AST
3. `You`: analyze AST in plugins and return metadata ---- there is a need for more plugins!
4. `Lupa`: merge metadata in reducer
5. `You`: use and query metadata and try to understand better your project, get some insights.

examples:

```js
var vfs = require('vinyl-fs');
var through = require('through2');

var parse = require('ast-stream');
var lupa = require('lupa');


vfs.src(['./*.js'])
    .pipe(parse)
    .pipe(lupa.input);

function findVariables(file, enc, cb) {
    // this is example lupa plugin

    var body = file.ast.program.body;

    // analyze AST
    var variables = body.filter(function (node) {
        return node.type == 'VariableDeclaration'
    }).reduce(function (vars, node) {
        return vars.concat(node.declarations.map(function (decl) {
            return decl.id.name;
        }));
    }, []);

    var result = file.clone();
    result.metadata = [{name: 'variables', data: variables}]; // add metadata
    cb(null, result);
}

lupa.plugin(findVariables);
