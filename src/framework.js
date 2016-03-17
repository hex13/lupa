var through = require('through2');
var MAX_LISTENERS = 10000000;
//var Path = require('path');


function framework(reducer, initialState) {
    var input = through.obj(function (file, enc, cb) {

        function matchJs(plugin, file) {
            return file.extname == '.js';
        }

        plugins.forEach(function (pluginDesc) {
            var plugin = pluginDesc.plugin;
            var match = pluginDesc.match || matchJs;
            if (match(plugin, file)) {
                //console.log('MATCH',file.path)
                plugin.write(file);

            }
            else
                ;//console.log("MISMATCH", file.path);
        });

        // WTF: when we pass `file` to callback, then it suddenly stop
        // after ten file (probably related to maxListeners)
        // so we pass null.
        cb(null, null);
        //cb(null, file);
    });

    var state = initialState;
    var plugins = [];
    var sink = through.obj(function (ch, enc, cb) {
        state = reducer(state, ch);
        //console.log(JSON.stringify(state, 0, 2));
        cb(null, ch);
    });
    sink._readableState.highWaterMark = MAX_LISTENERS;

    return {
        plugin: function (f, match) {
            var plugin = through.obj(f);
            plugins.push({plugin: plugin, match: match});
            //input.pipe(plugin).pipe(sink);
            plugin.pipe(sink);
        },
        output: sink,
        input: input,
        save: function (filename) {
            require('fs').writeFile(filename, JSON.stringify(state, 0, 2), 'utf8');
        },
        load: function (newState) {
            state = newState;
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
        },
        feed: function(data) {
            console.log("framework#feed", data);
            input.write(data);
        }
    };
}

module.exports = {
    framework: framework
}
