var chai = require('chai');
var expect = chai.expect;
var analysis = require('../analysis');
var Path = require('path');
var join = Path.join;
describe('analysis', function () {

    it('should analyze only files from lupaProject.json file pattern', function (done) {
        const mockRoot = Path.join(__dirname, '../mocks/exampleProject');
        const filesByPath = (files, path) => {
            return files.filter(f => f.path === join(mockRoot, path));
        }

        analysis.indexProject(Path.join(mockRoot, 'lupaProject.json'))
        analysis.indexing.subscribe(function (files) {
            expect(files.length).equal(2);
            expect(filesByPath(files, 'src/test/indexSpec.js').length).equal(1);
            expect(filesByPath(files, 'src/index.js').length).equal(1);
            expect(filesByPath(files, 'lupaProject.json').length).equal(0);
            expect(filesByPath(files, 'src/not-this.js.almost').length).equal(0);
            expect(filesByPath(files, 'a.js').length).equal(0);
            done();
        })
    });
});
