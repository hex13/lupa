var fs = require('fs');

var chai = require('chai');
var lupa = require('../lupa');


var expect = chai.expect;


describe("Lupa", function () {
    // TODO promises and chai are not working together very well
    // when error there is a timeout rather than proper text message
    // maybe try Chai-as-promised or something else.
    var datasets = [
        {
            name: 'mocks',
            disabled: false,
            verify: function verify(data) {
                console.log("Output data: ", JSON.stringify(data, null, 2));

                var name1 = 'mocks/funcMock.js';
                var name2 = 'mocks/1/objMock.js';
                expect(data).to.have.property(name1);
                expect(data).to.have.property(name2);
                expect(data[name1].file).to.equal(name1);
                expect(data[name1].abc).to.exist();
                expect(data[name1].abc.length).to.equal(2);

                expect(data[name2].file).to.equal(name2);
                expect(data[name2].abc).to.have.length(0);
                return data;
            },
            filePattern: "mocks/**/*.js",
            get plugins() {
                var plugins = [];
                plugins.push(require('../plugins/RegExpPlugin')(/function +(\w+).*\(.*?\)/g, 'abc'));
                return plugins;
            },
        },
        {
            name: 'commonjs mocks',
            //mappers: ['../mappers/CommonJSGraphMapper'],
            verify: function (data) {
                console.log("DATA", JSON.stringify(data,null,2));

                var out ='templates/data2.json';
                fs.writeFileSync(out, JSON.stringify(data,null,2), 'utf8');

            },
            filePattern: 'mocks/commonJS/*.js',
            get plugins() {
                var plugins = [].map(require).map(function (Constr) {
                    return Constr();
                });
                return plugins;
            },
        }
    ];

    function describeDataset (dataset) {
        if (dataset.disabled) {
            return;
        }

        describe("dataset `" + dataset.name + "`", function () {
            it("should return correct data structure (" + dataset.name + ")", function (done) {
                var promise = lupa.run(dataset.filePattern, dataset.plugins);

                if (dataset.mappers) {

                    dataset.mappers.map(require).map(function (factory) {
                        return factory();
                    })
                    .forEach(function (mapper) {
                        promise = promise.then(mapper);
                    })
                }

                promise
                .then(dataset.verify)
                .then(function (data) {
                    done();
                })

            });

        });
    }

    datasets.forEach(describeDataset);

});
