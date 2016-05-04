var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');


var lupa = require('../../lupa');
var HtmlPlugin = lupa.plugins.Html;


describe('Html Plugin', function () {
    var code = fs.readFileSync('../src/mocks/blah.html', 'utf8');


    beforeEach(function () {
        this.parser = HtmlPlugin();
    });

    it('should parse classes', function () {
        var data = this.parser(code);
        expect(data).to.exist().and.have.property('classes');

        var classes = ['.bingo', '.blog_post', '.cat', '.cat-23'];
        expect(data.classes).to.have.property('length', classes.length);
        expect(data.classes).to.include.members(classes);
    });
});
