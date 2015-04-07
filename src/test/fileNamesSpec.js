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

        it('should return correct structure, when file name contain hyphens', function () {
            var check = convertTemplate('app/:module/views/:name.html');
            var data = check('app/forum/views/something-good.html');
            expect(data).to.exist();
            expect(data).to.have.property('name').equal('something-good');
            expect(data).to.have.property('module').equal('forum');
        });

        it('should return correct structure, when file name contain underscore', function () {
            var check = convertTemplate('app/:module/view/:name.html');
            var data = check('app/forum/view/something_good.html');
            expect(data).to.exist();
            expect(data).to.have.property('name').equal('something_good');
            expect(data).to.have.property('module').equal('forum');
        });

        it('should return correct structure, when file name contain underscore (second test)', function () {
            var check = convertTemplate('app/:module/views/:name_*.html', {
                variable: '([a-zA-Z]+)'
            });
            var data = check('app/forum/views/something_good.html');
            expect(data).to.exist();
            expect(data).to.have.property('name').equal('something');
            expect(data).to.have.property('module').equal('forum');
        });


        it('should return correct structure, when pattern contain asterisks', function () {
            var check = convertTemplate('app/*/views/*/:name.html');
            var data = check('app/forum/views/something/index.html');
            expect(data).to.exist();
            expect(data).to.have.property('name').equal('index');
            expect(data).to.have.property('$1').equal('forum');
            expect(data).to.have.property('$2').equal('something');
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
            var tpl = 'abc/:test/:test/:secondtest';
            var data = {
                test: 'sun',
                secondtest: 'moon'
            };
            expect(renderTpl(tpl, data)).to.equal('abc/sun/sun/moon');
        });
        it('should render correct string when there are asterisks in tpl', function () {
            var tpl = 'abc/*/:test/*/:test/:secondtest';
            var data = {
                test: 'sun',
                secondtest: 'moon',
                '$1': 'earth',
                '$2': 'venus',
            };
            expect(renderTpl(tpl, data)).to.equal('abc/earth/sun/venus/sun/moon');
        });

    });

    describe('getRelatedFiles', function () {
        var transforms;
        var paths;

        beforeEach(function () {
            transforms = {
                style: function (data) {
                    var data_ = Object.create(data);
                    data_.name += '.sass';
                    return data_;
                }
            };

            paths = [
                ['controller', 'app/controllers/:name.js'],
                ['style', 'app/static/styles/:name.css'],
                ['view', 'app/view/:name.html']
            ];

        });

        it('should return correct array of objects with correct structure', function () {
            var file = 'app/controllers/test.js';

            paths.push(['test', 'app/scripts/:name-*.js']);


            var relatedFiles = getRelatedFiles(file, paths, transforms, {
                patterns: {
                    variable: '([a-zA-Z]+)'
                }
            });
            //expect(JSON.stringify(relatedFiles)).to.equal({});
            expect(relatedFiles).to.have.deep.property('[0].type').equal('controller');
            expect(relatedFiles).to.have.deep.property('[0].path').equal('app/controllers/test.js');

            expect(relatedFiles).to.have.deep.property('[1].type').equal('style');
            expect(relatedFiles).to.have.deep.property('[1].path').equal('app/static/styles/test.sass.css');

            expect(relatedFiles).to.have.deep.property('[2].type').equal('view');
            expect(relatedFiles).to.have.deep.property('[2].path').equal('app/view/test.html');

            expect(relatedFiles).to.have.deep.property('[3].type').equal('test');


        });

        it('should handle camel case file names', function () {
            var file = 'app/tests/whateverSpec.js';

            paths.push(['test', 'app/tests/:name*.js']);

            var relatedFiles = getRelatedFiles(file, paths, transforms, {
                patterns: {
                    variable: '([a-z]+)'
                }
            });

            expect(relatedFiles).to.have.deep.property('[0].type').equal('controller');
            expect(relatedFiles).to.have.deep.property('[0].path').equal('app/controllers/whatever.js');

            expect(relatedFiles).to.have.deep.property('[1].type').equal('style');
            expect(relatedFiles).to.have.deep.property('[1].path').equal('app/static/styles/whatever.sass.css');

            expect(relatedFiles).to.have.deep.property('[2].type').equal('view');
            expect(relatedFiles).to.have.deep.property('[2].path').equal('app/view/whatever.html');

            expect(relatedFiles).to.have.deep.property('[3].type').equal('test');
        });

        it('should handle underscore case file names', function () {
            var file = 'app/blah/whatever_blah.js';

            paths.push(['underscore', 'app/blah/:name_*.js']);

            var relatedFiles = getRelatedFiles(file, paths, transforms, {
                patterns: {
                    variable: '([a-z]+)'
                }
            });
            //expect(JSON.stringify(relatedFiles)).to.equal({});
            expect(relatedFiles).to.have.deep.property('[0].type').equal('controller');
            expect(relatedFiles).to.have.deep.property('[0].path').equal('app/controllers/whatever.js');

            expect(relatedFiles).to.have.deep.property('[1].type').equal('style');
            expect(relatedFiles).to.have.deep.property('[1].path').equal('app/static/styles/whatever.sass.css');

            expect(relatedFiles).to.have.deep.property('[2].type').equal('view');
            expect(relatedFiles).to.have.deep.property('[2].path').equal('app/view/whatever.html');

            expect(relatedFiles).to.have.deep.property('[3].type').equal('underscore');

            expect(relatedFiles).to.have.deep.property('[3].path').equal('app/blah/whatever_blah.js');
        });



    });
});
