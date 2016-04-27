var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var parser = require('esprima-fb');
var File = require('vinyl');

var Plugin = require('../javascript');
var getTodos = require('../todos');


function filterMetadata(metadata, type) {
    return metadata.filter(function (item) {
        return item.type === type;
    });
}

var mockPaths = [
    __dirname + '/../../src/mocks/functions.js',
    __dirname + '/../mocks/imports.js',
    __dirname + '/../mocks/classes.js',
    __dirname + '/../../src/mocks/chaining.js',
    __dirname + '/../mocks/todos.js',
]

describe('JavaScript plugin', function () {
    beforeEach(function () {
        var config = {
            namespaces: []
        }
        var mockPath = mockPaths.shift();
        var code = fs.readFileSync(mockPath);
        var ast = parser.parse(code, {
            ecmaVersion: 6,
            sourceType: 'module',
            loc: true
        });


        console.log(code, ast.body);
        this.file = new File({
            path: mockPath,
            contents: code,
        })
        this.file.ast = {
            root: ast
        };
        this.plugin = Plugin(config);
    })

    it.only('should extract function names', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;
            var functions = filterMetadata(metadata, 'function');
            expect(functions.length).equals(13);
            expect(functions[0].name).equals('abc');
            expect(functions[1].name).equals('def');
            expect(functions[2].name).equals('foo');
            expect(functions[3].name).equals('varFunc');
            expect(functions[4].name).equals('inner');
            expect(functions[5].name).equals('');
            expect(functions[6].name).equals('inIIFE');
            expect(functions[7].name).equals('inIIFE2');
            expect(functions[8].name).equals('callback');
            expect(functions[9].name).equals('render');
            expect(functions[10].name).equals('someMethod');
            expect(functions[11].name).equals('Component');

            for (var i = 0; i < 11; i++)
                expect(functions[i].jsx).not.ok();
            expect(functions[11].jsx).ok();
            expect(functions[12].jsx).ok();

            done();
        }
        this.plugin(this.file, null, cb)
    })

    it('should extract imports', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;
            var items = filterMetadata(metadata, 'import');
            expect(items[0].name).equals('fs');
            expect(items[0].originalSource).equals('fs');

            expect(items[1].name).equals('File');
            expect(items[1].originalSource).equals('vinyl');

            expect(items[2].name).equals('Rx');
            expect(items[2].originalSource).equals('Rx');

            expect(items[3].name).equals('React');
            expect(items[3].originalSource).equals('react');

            expect(items[4].name).equals('Cat');
            expect(items[4].originalSource).equals('animals');

            expect(items[5].name).equals('Dog');
            expect(items[5].originalSource).equals('animals');

            expect(items[6].name).equals('extname');
            expect(items[6].originalSource).equals('path');

            done();
        }
        this.plugin(this.file, null, cb)
    });

    it('should extract classes', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;
            var items = filterMetadata(metadata, 'class');

            expect(items[0].name).equals('Whatever');
            expect(items[0].methods).deep.equals(['handleClick', 'render']);

            expect(items[1].name).equals('Something');
            expect(items[1].methods).deep.equals(['constructor']);

            done();
        }
        this.plugin(this.file, null, cb)
    });

    it('should extract angular module dependencies', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;

            var modules = filterMetadata(metadata, 'angularModule');
            expect(modules.length).equals(1);
            expect(modules[0].name).equals('Something');

            var moduleDeps = filterMetadata(metadata, 'angularModuleDependency');
            expect(moduleDeps.length).equals(3);
            expect(moduleDeps[0].name).equals('dep1');
            expect(moduleDeps[1].name).equals('dep2');
            expect(moduleDeps[2].name).equals('dep3');

            done();
        }
        this.plugin(this.file, null, cb)
    });

    it('should extract todos', function (done) {
        function cb(f) {
            var metadata = f.metadata;

            var items = filterMetadata(metadata, 'todo');
            expect(items.length).equals(3);
            expect(items[0].name).equals('import react');
            expect(items[1].name).equals('change name to something better');
            expect(items[2].name).equals('insert render function');

            done();
        }
        getTodos(this.file).subscribe(cb);
    });



});
