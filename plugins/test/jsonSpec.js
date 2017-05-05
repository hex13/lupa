"use strict";

var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');

var File = require('vinyl');
var Plugin = require('../json');

var mockPaths = [
    __dirname + '/../mocks/json.json',
];

describe('Json plugin', function () {
    beforeEach(function () {
        var mockPath = mockPaths.shift();
        var code = fs.readFileSync(mockPath);

        this.file = new File({
            path: mockPath,
            contents: code,
        })

        this.plugin = Plugin();
    })

    it('should', function (done) {
        this.plugin(this.file, null, function (err, f) {

            //console.log("FFFF"0;
            const TygerTyger = f.metadata[5];
            expect(TygerTyger).to.have.deep.property('loc.start.line', 6);
            expect(TygerTyger).to.have.deep.property('loc.start.column', 20);
            expect(TygerTyger).to.have.deep.property('loc.end.line', 9);
            expect(TygerTyger).to.have.deep.property('loc.end.column', 34);

            console.log("@@@@@@@@", f.metadata)
            //expect(f.metadata).to.have.deep.property('[0].type', 'kotek');

            done();
        }.bind(this));
    });
});
