var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');


var lupa = require('../../lupa');
var HamlPlugin = lupa.plugins.Haml;


describe('Haml Plugin', function () {
    var code = fs.readFileSync('../src/mocks/blah.haml', 'utf8');


    beforeEach(function () {
        this.parser = HamlPlugin();
    });

    it('should parse classes', function () {
        var data = this.parser(code);
        expect(data).to.exist().and.have.property('classes');

        var classes = ['.cat', '.cow', '.dog', '.test'];
        expect(data.classes).to.have.property('length', classes.length);
        expect(data.classes).to.include.members(classes);
    });
});
