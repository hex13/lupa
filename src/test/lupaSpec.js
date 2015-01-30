var chai = require('chai');
var expect = chai.expect;

var lupa = require('../lupa');

describe("Lupa", function () {
    it("should return correct data structure", function (done) {
        var plugins = ['../plugins/SizePlugin', '../plugins/LOCPlugin.js'].map(require).map(function (Constr) {
            return Constr();
        });
        plugins.push(require('../plugins/RegExpPlugin')(/function +abc.*\(.*?\)/g, 'abc'));
        lupa.run("mocks/**/*.js", plugins, function (err, data) {
            console.log("Output data: ", JSON.stringify(data, null, 2));

            var name1 = 'mocks/funcMock.js';
            var name2 = 'mocks/1/objMock.js';
            expect(data).to.have.property(name1);
            expect(data).to.have.property(name2);
            expect(data[name1].file).to.equal(name1);
            expect(data[name1].size).to.equal(101);
            expect(data[name1].loc).to.equal(21);
            expect(data[name1].abc).to.exist();
            expect(data[name1].abc.length).to.equal(2);

            expect(data[name2].size).to.equal(44);
            expect(data[name2].loc).to.equal(5);
            expect(data[name2].file).to.equal(name2);
            expect(data[name2].abc).to.equal(null);
            done();
        });

        expect(false).to.equal(false);
    });
});
