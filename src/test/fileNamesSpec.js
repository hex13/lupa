var chai = require('chai');
var expect = chai.expect;

var fileNames = require('../lupa').fileNames;
var convertTemplate = fileNames.convertTemplate;
var renderTpl = fileNames.renderTpl;

describe('fileNames', function () {

    describe('convertTemplate', function () {
        it('should return correct structure with variables', function () {
            var check = convertTemplate('app/:module/views/:name.html');
            var data = check('app/forum/views/main.html');
            expect(data).to.exist();
            expect(data).to.have.property('name').equal('main');
            expect(data).to.have.property('module').equal('forum');
        });

        it('should return correct structure with variables if variable is repeated', function () {
            var check = convertTemplate('app/:module/views/:name/:name.html');
            var data = check('app/forum/views/main/main.html');
            expect(data).to.exist();
            expect(data).to.have.property('name').equal('main');
            expect(data).to.have.property('module').equal('forum');
        });

        it('should return nothing when patterns aren\'t matching', function () {
            var check = convertTemplate('app/:module/views/:name/:name.html');
            var data = check('app/forum/views/something/main.html');
            expect(data).to.not.exist();
        });


        it('should return nothing if file name has different beginning', function () {
            var check = convertTemplate('app/:module/views/:name.html');
            var data = check('blahapp/forum/views/main.html');
            expect(data).to.not.exist();
        });

        it('should return nothing if file name has different ending', function () {
            var check = convertTemplate('app/:module/views/:name.html');
            var data = check('app/forum/views/main.html.zip');
            expect(data).to.not.exist();
        });

    });
});
