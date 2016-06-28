'use strict';

var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var Path = require('path');
var parser = require('acorn-jsx');
var parserOptions = require('../../parsers/parserOptions')['.js'];

var File = require('vinyl');

var Plugin = require('../javascript');
var getTodos = require('../todos');


function filterMetadata(metadata, type) {
    return metadata.filter(function (item) {
        return item.type === type;
    });
}

var mockPaths = [ // notice: we mutate this array in beforeEach
    __dirname + '/../mocks/various.js',
    __dirname + '/../../src/mocks/functions.js',
    __dirname + '/../mocks/imports.js',
    __dirname + '/../mocks/classes.js',
    __dirname + '/../../src/mocks/chaining.js',
    __dirname + '/../mocks/todos.js',
    __dirname + '/../mocks/jsx.js',
    __dirname + '/../mocks/objects.js',
    __dirname + '/../mocks/exports.js',
    __dirname + '/../mocks/commonjs.js',
    __dirname + '/../mocks/commonjs2.js',
    __dirname + '/../mocks/commonjs3.js',
    __dirname + '/../mocks/commonjs4.js',
    __dirname + '/../mocks/variables.js',
].map(Path.normalize);

describe('JavaScript plugin', function () {
    beforeEach(function () {
        var config = {
            namespaces: []
        }
        var mockPath = mockPaths.shift(); // mutation of mockPaths
        var code = fs.readFileSync(mockPath);
        this.path = mockPath;

        this.file = new File({
            path: mockPath,
            contents: code,
        })

        var ast = parser.parse(code, parserOptions);

        this.file.ast = {
            root: ast
        };

        this.plugin = Plugin(config);
    })

    it('should assign type and file information to all entities', function (done) {
        function cb(err, f) {
            f.metadata.forEach( item => {
                expect(item).have.property('type');
                expect(item).have.deep.property('file.path').equal(this.path);
            });
            done();
        }
        this.plugin(this.file, null, cb.bind(this));
    });

    it('should extract function names', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;
            var functions = filterMetadata(metadata, 'function');
            expect(functions.length).equals(19);
            expect(functions[0].name).equals('abc');
            expect(functions[1].name).equals('def');

            expect(functions[2].name).equals('foo');
            expect(functions[2].params.length).equals(2);
            expect(functions[2].params[0].name).equals('a');
            expect(functions[2].params[1].name).equals('b');

            expect(functions[3].name).equals('varFunc');
            expect(functions[3].params.length).equals(3);
            expect(functions[3].params[0].name).equals('v1');
            expect(functions[3].params[1].name).equals('v2');
            expect(functions[3].params[2].name).equals('v3');


            expect(functions[4].name).equals('inner');
            expect(functions[5].name).equals('');
            expect(functions[6].name).equals('inIIFE');
            expect(functions[7].name).equals('inIIFE2');

            expect(functions[8].name).equals('callback');
            expect(functions[8].params.length).equals(0);
            expect(functions[8]).have.deep.property('argumentOf.name', 'setInterval');

            expect(functions[9].name).equals('render');
            expect(functions[9].params.length).equals(1);
            expect(functions[9].params[0].name).equals('nothing');
            expect(functions[9].parentClass.name).equals('C');

            expect(functions[10].name).equals('someMethod');
            expect(functions[10].params.length).equals(1);
            expect(functions[10].params[0].name).equals('blah');

            expect(functions[11].name).equals('Component');
            expect(functions[11].params.length).equals(1);
            expect(functions[11].params[0].name).equals('{destructured, blah}');

            expect(functions[13].name).equals('something');

            expect(functions[14].name).equals('lambda');
            expect(functions[14].params.length).equals(1);
            expect(functions[14].params[0].name).equals('test');

            expect(functions[15].name).equals('lambda2');
            expect(functions[15].params.length).equals(2);
            expect(functions[15].params[0].name).equals('a');
            expect(functions[15].params[1].name).equals('b');

            expect(functions[16].name).equals('whatever');
            expect(functions[16].params.length).equals(1);
            expect(functions[16].params[0].name).equals('arg');

            expect(functions[17].name).equals('method');
            expect(functions[17].params.length).equals(1);
            expect(functions[17].params[0].name).equals('arg');

            expect(functions[18].name).equals('');
            expect(functions[18].params.length).equals(0);
            expect(functions[18]).have.deep.property('argumentOf.name', 'callWithAnonymousCallback');

            for (let i = 0; i < functions.length; i++) {
                if (i === 8 || i === 18) continue;
                expect(functions).have.deep.property('[' + i + '].argumentOf.name', '');
            }

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

            items.forEach( (item, i) => {
                expect(items).have.deep.property('[' + i + '].loc');
            });


            done();
        }
        this.plugin(this.file, null, cb)
    });

    it('should extract classes', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;
            var items = filterMetadata(metadata, 'class');

            expect(items[0].name).equals('Whatever');
            expect(items[0]).to.have.deep.property('functions.length', 2);
            expect(items[0].functions).to.have.deep.property('[0].name', 'handleClick');
            expect(items[0].functions).to.have.deep.property('[1].name', 'render');

            expect(items[1].name).equals('Something');
            expect(items[1]).to.have.deep.property('superClass.name', 'React.Component');
            expect(items[1]).to.have.deep.property('functions.length', 2);
            expect(items[1].functions).to.have.deep.property('[0].name', 'constructor');
            expect(items[1].functions).to.have.deep.property('[0].isMethod', true);

            expect(items[1].functions).to.have.deep.property('[1].name', 'abc');
            expect(items[1].functions).to.have.deep.property('[1].isMethod', false);

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
            expect(modules[0]).have.property('loc');

            var moduleDeps = filterMetadata(metadata, 'angularModuleDependency');
            expect(moduleDeps.length).equals(3);
            expect(moduleDeps[0].name).equals('dep1');
            expect(moduleDeps[1].name).equals('dep2');
            expect(moduleDeps[2].name).equals('dep3');

            // TODO to.have
            expect(moduleDeps[0]).to.not.have.property('loc');

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

    it('should extract information from JSX', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;

            var items = filterMetadata(metadata, 'cssClass');

            expect(items.length).equals(4);
            expect(items).have.deep.property('[0].name', 'cat');
            expect(items).have.deep.property('[1].name', 'squirrel');
            expect(items).have.deep.property('[2].name', 'bar');
            expect(items).have.deep.property('[3].name', 'baz');

            var customElements = filterMetadata(metadata, 'jsxCustomElement');
            expect(customElements.length).equals(4);
            expect(customElements[0]).have.property('name', 'MyCustomComponent');
            expect(customElements[1]).have.property('name', 'Bar');
            expect(customElements[2]).have.property('name', 'blah.component');
            expect(customElements[3]).have.property('name', 'blah.other.component');

            done();
        }
        this.plugin(this.file, null, cb)
    });

    it('should extract information from object literals', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;

            var items = filterMetadata(metadata, 'objectLiteral');

            expect(items.length).equals(5);

            expect(items[0]).have.property('name', 'obj');

            expect(items[0]).have.deep.property('props.a', 2);
            expect(items[0]).have.deep.property('props.b', 3);
            expect(items[0]).have.deep.property('props.sum', 5);

            expect(items[1]).have.deep.property('props.type', 'addTodo');
            expect(items[1]).have.deep.property('props.text', 'this is todo');

            expect(items[2]).have.property('name', 'another');
            expect(items[2]).have.deep.property('props.one').deep.equal({bites: 'the dust'});

            expect(items[3]).have.property('name', 'one');
            expect(items[3]).have.deep.property('props.bites').equal('the dust');

            expect(items[4]).have.deep.property('props.four').equal('???');
            expect(items[4]).have.deep.property('props.London').equal('???');

            done();
        }
        this.plugin(this.file, null, cb)
    });

    it('should extract ES6 exports', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;

            var items = filterMetadata(metadata, 'exports');

            expect(items.length).equals(1);
            expect(items[0].data).deep.equals(['Abc', 'Def']);

            var items = filterMetadata(metadata, 'export');

            expect(items.length).equals(2);
            expect(items[0]).have.property('name', 'Abc');
            expect(items[1]).have.property('name', 'Def');

            items.forEach( (item, i) => {
                expect(items).have.deep.property('[' + i + '].loc');
            });


            done();
        }
        this.plugin(this.file, null, cb);
    });

    it('should extract CommonJS exports', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;

            var items = filterMetadata(metadata, 'exports');

            expect(items.length).equals(1);
            expect(items[0].data).deep.equals(['blah', 'bleh']);

            var items = filterMetadata(metadata, 'export');

            expect(items.length).equals(2);
            expect(items[0]).have.property('name', 'blah');
            expect(items[1]).have.property('name', 'bleh');

            items.forEach( (item, i) => {
                expect(items).have.deep.property('[' + i + '].loc');
            });

            done();
        }
        this.plugin(this.file, null, cb);

    });

    it('should extract CommonJS module.exports when exporting object literal', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;

            var items = filterMetadata(metadata, 'exports');

            expect(items.length).equals(1);
            expect(items[0].data).deep.equals(['abc', 'def']);

            var items = filterMetadata(metadata, 'export');

            expect(items.length).equals(2);
            expect(items[0]).have.property('name', 'abc');
            expect(items[1]).have.property('name', 'def');

            items.forEach( (item, i) => {
                expect(items).have.deep.property('[' + i + '].loc');
            });

            done();
        }
        this.plugin(this.file, null, cb);
    });

    it('should extract CommonJS module.exports when exporting identifier', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;

            var items = filterMetadata(metadata, 'export');

            expect(items.length).equals(1);
            expect(items[0]).have.property('name', 'Test');

            items.forEach( (item, i) => {
                expect(items).have.deep.property('[' + i + '].loc');
            });

            done();
        }
        this.plugin(this.file, null, cb);

    });

    it('should extract CommonJS module.exports when exporting function', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;

            var items = filterMetadata(metadata, 'export');

            expect(items.length).equals(1);
            expect(items[0]).have.property('name', 'someFunction');

            items.forEach( (item, i) => {
                expect(items).have.deep.property('[' + i + '].loc');
            });

            done();
        }
        this.plugin(this.file, null, cb);

    });


        it('should extract variable declarations', function (done) {
            function cb(err, f) {
                var metadata = f.metadata;

                var items = filterMetadata(metadata, 'variableDeclaration');

                expect(items.length).equals(6);
                expect(items[0]).have.property('name', 'topLevelVariable');

                expect(items[1]).have.property('name', 'anotherTopLevelVariable');

                expect(items[2]).have.property('name', 'a');

                expect(items[3]).have.property('name', 'b');
                expect(items[3]).have.deep.property('scope.name', 'foo');
                expect(items[3]).have.deep.property('scope.loc.start.line');

                expect(items[4]).have.property('name', 'c');
                expect(items[4]).have.deep.property('scope.name', 'foo');
                expect(items[4]).have.deep.property('scope.loc.start.line');

                expect(items[5]).have.property('name', 'z');


                items.forEach( (item, i) => {
                    expect(items).have.deep.property('[' + i + '].loc').exist();
                });

                done();
            }
            this.plugin(this.file, null, cb);

        });





});
