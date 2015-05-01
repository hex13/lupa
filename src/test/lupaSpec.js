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
            disabled: true,
            name: 'phaser',
            verify: function(data) {
                console.log("Output data: ", JSON.stringify(data, null, 2));

                //TODO this is temporary
                data.root = data["../../resources/phaser/src/core/State.js"];


                var out ='templates/data.json';
                //console.log("Write data to " +  out);
                fs.writeFileSync(out, JSON.stringify(data,null,2), 'utf8');

                // TODO make proper test case
                expect(data).to.have.property("LinkedList");
                expect(data).to.have.property("ArrayUtils");
                expect(data.ArrayUtils[1]).to.have.length(2);


                return data;
            },
            filePattern: '../../resources/phaser/src/**/*.js',
            get plugins() {
                var plugins = [];
                plugins.push(require('../plugins/RegExpDependencyPlugin')(/Phaser\.(\w+)/g, 1));
                return plugins;
            },
            //mappers: ['../mappers/HumanReadableMapper', '../mappers/GraphMapper']
        },
        {
            name: 'commonjs mocks',
            //mappers: ['../mappers/CommonJSGraphMapper'],
            verify: function (data) {
                console.log("DATA", JSON.stringify(data,null,2));
                //TODO this is temporary. Move this code to Gruntfile
                // and make grunt tasks
                // but now: run from src directory, and check manually
                // what is produced
                var out ='templates/data2.json';
                //console.log("Write data to " +  out);
                fs.writeFileSync(out, JSON.stringify(data,null,2), 'utf8');

            },
            filePattern: 'mocks/commonJS/*.js',
            get plugins() {
                var plugins = [].map(require).map(function (Constr) {
                    return Constr();
                });
                plugins.push(require('../plugins/RegExpDependencyPlugin')(/require.*\( *(['"])(.*?)\1 *?\)/g, 2) )
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
