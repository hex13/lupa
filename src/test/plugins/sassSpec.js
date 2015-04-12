var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;

var lupa = require('../../lupa');
var SassPlugin = lupa.plugins.Sass;


describe('Sass Plugin', function () {
    var code = fs.readFileSync('mocks/mixins.sass');

    it('should be implemented', function () {
        expect(SassPlugin).to.exist();
    });

    it('should parse mixin declaration and uses', function () {
        var sassPlugin = SassPlugin();
        var data = sassPlugin(code);
        //expect(data).to.exist().and.have.deep.property('mixins.declarations.colorize');
        //expect(data).to.exist().and.have.deep.property('mixins.declarations.Blah-blah');
        //
        //expect(data).to.exist().and.have.deep.property('mixins.uses.some-mixin');
        //
        //expect(data).to.exist().and.not.have.deep.property('+');
        //expect(data).to.exist().and.not.have.deep.property('mixins.uses.span');
        //expect(data).to.exist().and.have.deep.property('mixins.uses.some-other');
        //expect(data).to.exist().and.have.deep.property('mixins.uses.aaa');
        expect(data).to.exist().and.have.property('mixins');
        var mixins = data.mixins;

        expect(mixins.declarations).to.include('colorize');
        expect(mixins.declarations).to.include('Blah-blah');
        expect(mixins.declarations).to.include('underscore_mixin');

        expect(mixins.uses).to.include('some-mixin');
        expect(mixins.uses).not.to.include('+');
        expect(mixins.uses).not.to.include('span');
        expect(mixins.uses).to.include('some-other');
        expect(mixins.uses).to.include('underscore_include');


    });
});

