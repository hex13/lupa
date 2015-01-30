var chai = require('chai');
var expect = chai.expect;

var lupa = require('../lupa');

describe("Lupa", function () {
    it("should return correct data structure", function (done) {
        var plugins = ['../plugins/SizePlugin', '../plugins/LOCPlugin.js'].map(require).map(function (Constr) {
            return Constr();
        });
        lupa.run("mocks/**/*.js", plugins, function (err, data) {
            console.log("Output data: ", JSON.stringify(data, null, 2));

            var name1 = 'mocks/funcMock.js';
            var name2 = 'mocks/1/objMock.js';
            expect(data).to.have.property(name1);
            expect(data).to.have.property(name2);
            expect(data[name1].file).to.equal(name1);
            expect(data[name1].size).to.equal(68);
            expect(data[name1].loc).to.equal(17);

            expect(data[name2].size).to.equal(32);
            expect(data[name2].loc).to.equal(4);
            expect(data[name2].file).to.equal(name2)
            done();
        });

        expect(false).to.equal(false);
    });
});
