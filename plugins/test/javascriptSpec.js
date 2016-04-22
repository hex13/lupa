var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var parser = require('esprima-fb');
var File = require('vinyl');

var Plugin = require('../javascript');

function filterMetadata(metadata, type) {
    return metadata.filter(function (item) {
        return item.type === type;
    });
}

var mockPaths = [
    __dirname + '/../../src/mocks/functions.js',
    __dirname + '/../mocks/imports.js',
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

    it('should extract function names', function (done) {
        function cb(err, f) {
            var metadata = f.metadata;
            var functions = filterMetadata(metadata, 'function');
            functions.forEach(function (item) {
                console.log(item);
            });
            expect(functions[0].name).equals('abc');
            expect(functions[1].name).equals('def');
            expect(functions[2].name).equals('foo');
            done();
        }
        var data = this.plugin(this.file, null, cb)
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

            done();
        }
        var data = this.plugin(this.file, null, cb)
    })

});
