var fs = require('fs');

var chai = require('chai');
var expect = chai.expect;

var lupa = require('../lupa');
var join = require('path').join;


describe('Lupa chaining', function () {
    describe('file method', function () {
        beforeEach(function () {
            this.filename = join(__dirname, '../mocks/routes.rb');
        });

        it('should be implemented', function () {
            expect(lupa.file).to.be.a('function');
        });

        it('should return correct object and should analyze file (todo: split tests)', function () {
            var filename = this.filename;
            var fileObj = lupa.file(filename);

            expect(fileObj).to.exist().and.have.property('path').equal(filename);

            var result = fileObj.analyze(lupa.plugins.RailsRoutes());
            expect(result).to.exist();
            expect(result.data).to.exist().and.to.have.property('urls');
            expect(result.render).to.be.a('function');
            expect(result.render('urls')).to.be.a('string');
        });

        it('should chain', function () {
            var res = lupa.file(join(__dirname, '../mocks/routes.rb')).analyze(lupa.plugins.RailsRoutes()).render('urls');
            expect(res).to.be.a('string');
        });


        it('should chain with plugin name instead of function', function () {
            var res1 = lupa.file(this.filename).analyze('RailsRoutes').render('urls');
            var res2 = lupa.file(this.filename).analyze(lupa.plugins.RailsRoutes()).render('urls');
            expect(res1).to.be.a('string');
            expect(res1).to.be.equal(res2);
        });
    });

});
