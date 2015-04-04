var chai = require('chai');
var expect = chai.expect;

var fileNames = require('../lupa').fileNames;
var convertTemplate = fileNames.convertTemplate;
var renderTpl = fileNames.renderTpl;
var getRelatedFiles = fileNames.getRelatedFiles;


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

        it('should return correct structure with variables when passing asterisk', function () {
            var check = convertTemplate('src/*/:module/views/:name.html');
            var data = check('src/app/forum/views/main.html');
            expect(data).to.exist();
            expect(data).to.have.property('module').equal('forum');
            expect(data).to.have.property('name').equal('main');
        });

        it('should return nothing when passing asterisk and there is no match', function () {
            var check = convertTemplate('src/*/:module/views/:name.html');
            var data = check('src/app/forum/views123/main.html');
            expect(data).to.not.exist();
        });
    });

    describe('renderTpl', function () {
        it('should render correct string', function () {
            var tpl = 'abc/:test/:test/:test2';
            var data = {
                test: 'sun',
                test2: 'moon'
            };
            expect(renderTpl(tpl, data)).to.equal('abc/sun/sun/moon');
        });
    });

    describe('getRelatedFiles', function () {
        it('should return correct array of objects with correct structure', function () {

            var file = 'app/controllers/test.js';

            var paths = [
                ['controller', 'app/controllers/:name.js'],
                ['style', 'app/static/styles/:name.css'],
                ['view', 'app/view/:name.html']
            ];


            var transforms = {
                style: function (data) {
                    var data_ = Object.create(data);
                    data_.name += '.sass';
                    return data_;
                }
            };

            var relatedFiles = getRelatedFiles(file, paths, transforms);
            expect(relatedFiles).to.have.deep.property('[0].type').equal('controller');
            expect(relatedFiles).to.have.deep.property('[0].path').equal('app/controllers/test.js');

            expect(relatedFiles).to.have.deep.property('[1].type').equal('style');
            expect(relatedFiles).to.have.deep.property('[1].path').equal('app/static/styles/test.sass.css');

            expect(relatedFiles).to.have.deep.property('[2].type').equal('view');
            expect(relatedFiles).to.have.deep.property('[2].path').equal('app/view/test.html');



        });
    });
});
