'use strict';

var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var Path = require('path');

var File = require('vinyl');

var Plugin = require('../typescript');

function filterMetadata(metadata, type) {
    return metadata.filter(function (item) {
        return item.type === type;
    });
}

var mockPaths = [ // notice: we mutate this array in beforeEach
    __dirname + '/../mocks/typescript.ts',
].map(Path.normalize);

describe('TypeScript plugin', function () {
    beforeEach(function () {
        var mockPath = mockPaths.shift(); // mutation of mockPaths
        var code = fs.readFileSync(mockPath);
        this.path = mockPath;

        this.file = new File({
            path: mockPath,
            contents: code,
        })

        this.plugin = Plugin();
    })

    it('should return structure of TypeScript file', function (done) {

        function cb(err, f) {
            const items = f.metadata;

            items.forEach( item => {
                expect(item).have.deep.property('file.path').equal(this.path);
            });


            const classes = filterMetadata(items, 'class');
            expect(classes.length).equal(2);
            expect(classes[0]).have.property('name', 'Def');
            expect(classes[0]).have.deep.property('functions.length', 2);
            expect(classes[0]).have.deep.property('functions[0].name', 'foo');
            expect(classes[0]).have.deep.property('functions[1].name', 'render');
            expect(classes[0]).have.deep.property('loc.start.line', 1);
            expect(classes[0]).have.deep.property('loc.start.column', 0);
            expect(classes[0]).have.deep.property('loc.end.line', 8);
            expect(classes[0]).have.deep.property('loc.end.column', 1);



            expect(classes[1]).have.property('name', 'Abc');
            expect(classes[1]).have.deep.property('functions.length', 1);
            expect(classes[1]).have.deep.property('functions[0].name', 'bar');
            expect(classes[1]).have.deep.property('loc.start.line', 10);
            expect(classes[1]).have.deep.property('loc.start.column', 4);
            //expect(classes[1]).have.deep.property('loc.start.line', 10);

            const funcs = filterMetadata(items, 'function');
            expect(funcs[0]).have.deep.property('name', 'panda');
            expect(funcs[0]).have.deep.property('loc.start.line', 16);
            expect(funcs[0]).have.deep.property('loc.start.column', 1);
            expect(funcs[0]).have.deep.property('loc.end.line', 18);
            expect(funcs[0]).have.deep.property('loc.end.column', 6);

            const vars = filterMetadata(items, 'variableDeclaration');
            expect(vars.length).equal(3);
//            expect(funcs[0]).have.property('name', 'panda');

            done();
        }
        this.plugin(this.file, null, cb.bind(this));
    });
});
