var chai = require('chai');
var expect = chai.expect;

var lupa = require('../lupa');

describe("Lupa", function () {

    var datasets = [
        {
            name: 'mocks',
            verify: function verify(done, err, data) {
                console.log("Output data: ", JSON.stringify(data, null, 2));

                var name1 = 'mocks/funcMock.js';
                var name2 = 'mocks/1/objMock.js';
                expect(data).to.have.property(name1);
                expect(data).to.have.property(name2);
                expect(data[name1].file).to.equal(name1);
                expect(data[name1].size).to.equal(101);
                expect(data[name1].loc).to.equal(21);
                expect(data[name1].abc).to.exist();
                expect(data[name1].abc.length).to.equal(2);

                expect(data[name2].size).to.equal(44);
                expect(data[name2].loc).to.equal(5);
                expect(data[name2].file).to.equal(name2);
                expect(data[name2].abc).to.have.length(0);
                done();
            },
            filePattern: "mocks/**/*.js",
            get plugins() {
                var plugins = ['../plugins/SizePlugin', '../plugins/LOCPlugin.js'].map(require).map(function (Constr) {
                    return Constr();
                });

                plugins.push(require('../plugins/RegExpPlugin')(/function +(\w+).*\(.*?\)/g, 'abc'));
                return plugins;
            }
        },
        {
            name: 'phaser',
            verify: function(done, err, data) {
                // TODO make proper test case 
                console.log("Output data: ", JSON.stringify(data, null, 2));
                done();
            },
            filePattern: '../../resources/phaser/src/**/*.js',
            get plugins() {
                var plugins = ['../plugins/SizePlugin', '../plugins/LOCPlugin.js'].map(require).map(function (Constr) {
                    return Constr();
                });

                plugins.push(require('../plugins/RegExpPlugin')(/Phaser\.(\w+)/g, 'phaser', {removeDuplicates: true}));
                return plugins;
            }
        }
    ];

    function describeDataset (dataset) {
        describe("dataset 1", function () {
            it("should return correct data structure (" + dataset.name + ")", function (done) {
                lupa.run(dataset.filePattern, dataset.plugins, dataset.verify.bind(null, done));
            });

        });
    }

    datasets.forEach(describeDataset);

});
