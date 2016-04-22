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

describe('JavaScript plugin', function () {
    beforeEach(function () {
        var config = {
            namespaces: []
        }
        var mockPath = __dirname + '/../../src/mocks/functions.js';
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
});
