var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');

var File = require('vinyl');
var flavors = require('html-flavors');
var Plugin = require('../html');

var mockPaths = [
    __dirname + '/../mocks/html.html',
];

describe('Html plugin', function () {
    beforeEach(function () {
        var mockPath = mockPaths.shift();
        var code = fs.readFileSync(mockPath);

        this.file = new File({
            path: mockPath,
            contents: code,
        })

        const ast = flavors.parseHtml(code);
        this.file.ast = {
            root: ast
        };
        this.file.metadata = [{type: 'test-metadata'}];

        this.plugin = Plugin();
    })

    it('should', function (done) {
        this.plugin(this.file, null, function (err, f) {
            expect(f.path).equal(this.file.path);
            expect(f.metadata).to.have.deep.property('[0].type', 'test-metadata');
            expect(f.metadata).to.have.deep.property('[1].href', 'index.css');
            expect(f.metadata).to.have.deep.property('[2].href', 'second.css');
            done();
        }.bind(this));
    });
});
