var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');


var lupa = require('../../lupa');
var SassPlugin = lupa.plugins.Sass;


describe('Sass Plugin', function () {
    var code = fs.readFileSync('mocks/mixins.sass', 'utf8');

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

        expect(data).to.exist();
        expect(data).to.have.property('mixins');
        expect(data).to.have.property('classes');
        expect(data.classes).to.have.property('length').equal(3);
        expect(data.classes).to.have.members(['.some-class', '.underscore_class', '.number123']);

        var mixins = data.mixins;

        expect(mixins.declarations).to.have.property('length').equal(4);
        expect(mixins.declarations).to.include('colorize');
        expect(mixins.declarations).to.include('Blah-blah');
        expect(mixins.declarations).to.include('underscore_mixin');
        expect(mixins.declarations).to.include('col2-small-font');


        expect(mixins.uses).to.have.property('length').equal(4);
        expect(mixins.uses).to.include('some-mixin');
        expect(mixins.uses).not.to.include('+');
        expect(mixins.uses).not.to.include('span');
        expect(mixins.uses).not.to.include('label');
        expect(mixins.uses).to.include('some-other');
        expect(mixins.uses).to.include('underscore_include');
        expect(mixins.uses).to.include('col1-small-font');


        expect(_.uniq(mixins.uses).length).to.equal(mixins.uses.length);

        expect(data).to.have.property('variables');
        expect(data.variables).to.have.property('length').equal(1);
        expect(_.uniq(data.variables).length).to.equal(data.variables.length);
        expect(data.variables).to.include('$color');

    });
});

