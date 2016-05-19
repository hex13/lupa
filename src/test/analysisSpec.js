var chai = require('chai');
var expect = chai.expect;
var analysis = require('../analysis');
var Path = require('path');
var join = Path.join;


function afterIndexing(analysis, cb) {
    analysis.indexing.subscribe(cb);
}

describe('analysis', function () {

    it('should analyze only files from lupaProject.json file pattern', function (done) {
        const mockRoot = Path.join(__dirname, '../mocks/exampleProject');
        const filesByPath = (files, path) => {
            return files.filter(f => f.path === join(mockRoot, path));
        }

        analysis.indexProject(mockRoot)
        afterIndexing(analysis, function (files) {
            expect(files.length).equal(2);
            expect(filesByPath(files, 'src/test/indexSpec.js').length).equal(1);

            expect(filesByPath(files, 'src/index.js').length).equal(1);
            const indexFile = filesByPath(files, 'src/index.js')[0];
            const indexLines = indexFile.metadata.filter(o => o.type == 'lines');
            expect(indexLines.length).equal(1);
            expect(indexLines[0].data).deep.equal([30]);



            expect(filesByPath(files, 'lupaProject.json').length).equal(0);
            expect(filesByPath(files, 'src/not-this.js.almost').length).equal(0);
            expect(filesByPath(files, 'a.js').length).equal(0);

            // TODO move to separate it() and add beforeEach()
            analysis.findImporters(Path.join(mockRoot, 'src/index.js')).toArray().subscribe(function (files) {
                expect(files.length).equal(1);
                expect(files[0].path).equal(Path.join(mockRoot, 'src/test/indexSpec.js'));
            });
            done();
        });
    });
});
