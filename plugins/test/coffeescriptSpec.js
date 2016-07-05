var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');

var File = require('vinyl');
var flavors = require('html-flavors');
var Plugin = require('../coffeescript');

var mockPaths = [
    __dirname + '/../mocks/coffeescript.coffee',
];

describe('Coffeescript plugin', function () {
    beforeEach(function () {
        var mockPath = mockPaths.shift();
        var code = fs.readFileSync(mockPath);

        this.file = new File({
            path: mockPath,
            contents: code,
        })

        const ast = null;
        this.file.ast = {
            root: ast
        };
        this.file.metadata = [{type: 'test-metadata'}];

        this.plugin = Plugin;
    })

    it('should analyze coffeescript.', function (done) {
        this.plugin(this.file, null, (err, f) => {
            expect(f.path).equal(this.file.path);
            expect(f.metadata.length).to.deep.equal(8);

            expect(f.metadata).to.have.deep.property('[0].type', 'test-metadata');

            expect(f.metadata).to.have.deep.property('[1].type', 'import');
            expect(f.metadata).to.have.deep.property('[1].name', 'React');
            expect(f.metadata).to.have.deep.property('[1].originalSource', 'react');

            expect(f.metadata).to.have.deep.property('[2].type', 'import');
            expect(f.metadata).to.have.deep.property('[2].name', '_');
            expect(f.metadata).to.have.deep.property('[2].originalSource', 'underscore');

            expect(f.metadata).to.have.deep.property('[3].type', 'class');
            expect(f.metadata).to.have.deep.property('[3].name', 'Foo');
            expect(f.metadata).to.have.deep.property('[3].superClass.name', '');
            expect(f.metadata).to.have.deep.property('[3].loc.start.line');

            expect(f.metadata).to.have.deep.property('[4].type', 'class');
            expect(f.metadata).to.have.deep.property('[4].name', 'Bar');
            expect(f.metadata).to.have.deep.property('[4].loc.start.line');

            expect(f.metadata).to.have.deep.property('[5].type', 'function');
            expect(f.metadata).to.have.deep.property('[5].name', 'foo');
            expect(f.metadata).to.have.deep.property('[5].loc.start.line');
            expect(f.metadata).to.have.deep.property('[5].params');

            expect(f.metadata).to.have.deep.property('[6].type', 'function');
            expect(f.metadata).to.have.deep.property('[6].name', 'initialize');
            expect(f.metadata).to.have.deep.property('[6].loc.start.line');
            expect(f.metadata).to.have.deep.property('[6].params');

            expect(f.metadata).to.have.deep.property('[7].type', 'function');
            expect(f.metadata).to.have.deep.property('[7].name', 'initialize2');
            expect(f.metadata).to.have.deep.property('[7].loc.start.line');
            expect(f.metadata).to.have.deep.property('[7].params');


            done();
        })
        // this.plugin(this.file, null, function (err, f) {
        //     expect(f.path).equal(this.file.path);
        //     expect(f.metadata).to.have.deep.property('[0].type', 'test-metadata');
        //     expect(f.metadata).to.have.deep.property('[1].href', 'index.css');
        //     expect(f.metadata).to.have.deep.property('[2].href', 'second.css');
        //     done();
        // }.bind(this));
    });
});
