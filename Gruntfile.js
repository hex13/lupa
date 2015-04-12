var child_process = require('child_process');
var fs = require('fs');

var lupa = require('./src/lupa');



module.exports = function (grunt) {
    grunt.initConfig({
    });



    var datasets = {
        mocks: {
            name: 'commonjs mocks',
            //mappers: ['../mappers/CommonJSGraphMapper'],
            verify: function (data) {
                console.log("DATA", JSON.stringify(data,null,2));
                var out ='src/templates/data.json';

                //TODO this is temporary
                for (var first in data) {
                    data.root = data[first];
                    break;
                }
                fs.writeFileSync(out, JSON.stringify(data,null,2), 'utf8');
            },
            filePattern: 'src/mocks/commonJS/*.js',
            get plugins() {
                var plugins = [].map(require).map(function (Constr) {
                    return Constr();
                });
                plugins.push(require('./src/plugins/RegExpDependencyPlugin')(/require.*\( *(['"])(.*?)\1 *?\)/g, 2) )
                return plugins;
            },
        }
    }

    grunt.registerTask('graph', function (name) {
        var done = this.async();
        var dataset = datasets[name];
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
        .then(function () {
            done();
        })

    });

    grunt.registerTask('test', function () {
        var done = this.async();
        child_process.exec("mocha -c --recursive", {cwd: 'src'}, function (err, stdout) {
            console.log(stdout);
            done(!!!err);
        });
    });
};
