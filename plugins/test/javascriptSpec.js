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
    __dirname + '/../mocks/jsx.js',
    __dirname + '/../mocks/objects.js',
]

describe('JavaScript plugin', function () {
    beforeEach(function () {
        var config = {
            namespaces: []
        }
        var mockPath = mockPaths.shift();
        var code = fs.readFileSync(mockPath);

        this.file = new File({
            path: mockPath,
            contents: code,
        })

        var ast = parser.parse(code, {
            ecmaVersion: 6,
            sourceType: 'module',
            loc: true
        });

        this.file.ast = {
            root: ast
        };

        this.plugin = Plugin(config);
    })

    it('should extract function names', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;
            var functions = filterMetadata(metadata, 'function');
            expect(functions.length).equals(16);
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
            expect(items[0]).to.have.deep.property('functions.length', 2);
            expect(items[0].functions).to.have.deep.property('[0].name', 'handleClick');
            expect(items[0].functions).to.have.deep.property('[1].name', 'render');

            expect(items[1].name).equals('Something');
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

            expect(items.length).equals(4);

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

            done();
        }
        this.plugin(this.file, null, cb)
    });


});
