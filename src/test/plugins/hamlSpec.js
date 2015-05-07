var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');


var lupa = require('../../lupa');
var HamlPlugin = lupa.plugins.Haml;


xdescribe('Haml Plugin', function () {
    var code = fs.readFileSync('mocks/blah.haml', 'utf8');

    it('should be implemented', function () {
        expect(HamlPlugin).to.exist();
    });
});