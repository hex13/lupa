var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');


var lupa = require('../../lupa');
var SassPlugin = lupa.plugins.Sass;


describe('Sass Plugin', function () {
    var code = fs.readFileSync('../src/mocks/mixins.sass', 'utf8');

    it('should be implemented', function () {
        expect(SassPlugin).to.exist();
    });

    it('should parse mixin declaration and uses', function () {
        var sassPlugin = SassPlugin();
        var data = sassPlugin(code);

        expect(data).to.exist();
        expect(data).to.have.property('mixins');
        expect(data).to.have.property('classes');
        expect(data.classes).to.have.property('length').equal(3);
        expect(data.classes).to.have.members(['.some-class', '.underscore_class', '.number123']);

        var mixins = data.mixins;

        var mixinDeclarationCount = 4;
        expect(mixins.declarations).to.have.property('length').equal(mixinDeclarationCount);
        expect(mixins.declarations).to.have.deep.property("[0].name", 'col2-small-font');
        expect(mixins.declarations).to.have.deep.property("[1].name", 'colorize');
        expect(mixins.declarations).to.have.deep.property("[2].name", 'Blah-blah');
        expect(mixins.declarations).to.have.deep.property("[3].name", 'underscore_mixin');


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

        expect(data).to.have.property('tags');

        var tags = data.tags;

        expect(tags).to.exist().and.have.property('length', mixinDeclarationCount);
        expect(tags[0]).to.exist().and.have.property('name', 'col2-small-font');
        expect(tags[1]).to.exist().and.have.property('name', 'colorize');
        expect(tags[2]).to.exist().and.have.property('name', 'Blah-blah');
        expect(tags[3]).to.exist().and.have.property('name', 'underscore_mixin');


        expect(tags[0]).to.have.property('line', 6);
        expect(tags[1]).to.have.property('line', 11);
        expect(tags[2]).to.have.property('line', 36);
        expect(tags[3]).to.have.property('line', 48);


    });
});
