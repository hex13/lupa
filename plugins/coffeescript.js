const Metadata = require('../src/metadata');
var utils = require('./utils');
var resolveModulePath = utils.resolveModulePath;

const Rx = require('rx');

module.exports = function coffee (file) {
    return Rx.Observable.create(
        observer => {
            var code = file.contents.toString();
            var lines = code.split('\n');
            var requires = [];
            lines.forEach( line => {
                const reCoffeeRequire = /(([\w{} ,]+) = require *\(? *["'](.*)['"])|(\s*#)/;
                const match = line.match(reCoffeeRequire);
                if (match && !match[4]) {
                    var originalSource = match[3];
                    var variable = match[2];
                    var source = resolveModulePath(file.path, originalSource);
                    requires.push({
                        type: 'import',
                        name: variable,
                        source: source,
                        originalSource: originalSource
                    });
                }
            });
            var clone = Metadata.addMetadata(file, [{
                name: 'imports',
                data: requires
            }]);
            observer.onNext(clone);


        }
    )
};
