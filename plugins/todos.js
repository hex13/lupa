var Rx = require('rx');
var Metadata = require('../src/metadata');
module.exports = function getTodos(file) {
    return Rx.Observable.create(
        observer => {
            const regexp = /\Wtodo\W+(\w.*)/i;
            const code = file.contents.toString();
            const lines = code.split('\n');
            const result = [];
            lines.forEach(function (line, i) {
                const match = line.match(regexp);
                if (match) {
                    result.push({
                        type: 'todo',
                        name: match[1],
                        loc: {
                            start: {
                                column: 0, line: i + 1
                            },
                            end: {
                                column: 0, line: i + 2
                            }
                        }
                    })
                }
            });
            var clone = Metadata.addMetadata(file, result);
            observer.onNext(clone);
        }
    );
}
