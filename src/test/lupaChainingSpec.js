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

            var result = lupa.analyze({files: [this.filename], plugins: [lupa.plugins.RailsRoutes()]});
            expect(result).to.exist();
            expect(result.data).to.exist().and.to.have.deep.property('[0].urls');
            expect(result.data[0].urls).to.have.property('length').equal(7);
            expect(result.render).to.be.a('function');
            expect(result.render('urls')).to.be.a('string');
        });

        it('should chain', function () {
            var res = lupa.analyze({
                files: [join(__dirname, '../mocks/routes.rb')],
                plugins: [lupa.plugins.RailsRoutes()]
            }).render('urls');
            expect(res).to.be.a('string');
        });


        it('should chain with plugin name instead of function', function () {
            var res1 = lupa.analyze({
                files: [this.filename],
                plugins: ['RailsRoutes']
            }).render('urls');
            var res2 = lupa.analyze({
                files: [this.filename],
                plugins: [lupa.plugins.RailsRoutes()]
            }).render('urls');
            expect(res1).to.be.a('string');
            expect(res1).to.be.equal(res2);
        });

        it('should run all passed plugins', function () {
            var res = lupa.analyze({
                files: [this.filename],
                plugins: ['RailsRoutes', 'TestAnimals']
            });
            expect(res).to.exist().and.have.deep.property('data[0].urls.length').equal(7);
            expect(res.data[0].testAnimals).to.exist().and.eql(['cat', 'dog', 'mouse', 'kangaroo']);
            expect(res.data[0].testAnimals).to.exist().and.eql(['cat', 'dog', 'mouse', 'kangaroo']);
            expect(res.data[0].testAnimals_code).to.equal(lupa.file(this.filename).read())

        });



    });

});
