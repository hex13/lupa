var through = require('through2');
var MAX_LISTENERS = 10000000;


function framework(reducer, initialState) {
    var input = through.obj(function (ch, enc, cb) {
        cb(null, ch);
    });

    var state = initialState;
    var sink = through.obj(function (ch, enc, cb) {
        state = reducer(state, ch);
        //console.log(JSON.stringify(state, 0, 2));
        cb(null, ch);
    });
    sink._readableState.highWaterMark = MAX_LISTENERS;

    return {
        plugin: function (f) {
            var plugin = through.obj(f);
            input.pipe(plugin).pipe(sink);
        },
        output: sink,
        input: input,
        save: function (filename) {
            require('fs').writeFile(filename, JSON.stringify(state, 0, 2), 'utf8');
        },
        getState: function () {
            return state;
        },
        metadata: function (name) {
            return state.files.reduce(function (acc, file) {
                var metadata = file.metadata.filter(function (m) {
                    return m.name == name;
                });
                return acc.concat({
                    path: file.path,
                    metadata: metadata
                });
            }, []);
        }
    };
}

module.exports = {
    framework: framework
}
