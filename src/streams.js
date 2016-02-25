var through = require('through2');

function framework(reducer, initialState) {
    var input = through.obj(function (ch, enc, cb) {
        cb(null, ch);
    });

    var state = initialState;
    var sink = through.obj(function (ch, enc, cb) {
        state = reducer(state, ch);
        console.log(JSON.stringify(state, 0, 2));
        cb(null, ch);
    });

    return {
        plugin: function (f) {
            var plugin = through.obj(f);
            input.pipe(plugin).pipe(sink);
        },
        output: sink,
        input: input,
    };
}

module.exports = {
    framework: framework
}
