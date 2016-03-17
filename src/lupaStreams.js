var _ = require('lodash');
var streams = require('./framework');

function reduceFileData(state, file) {
    var files = state.files;
    var idx = _.findIndex(files, function (f) {
        return f.path == file.path;
    });

    if (idx == -1) {
        record = {
            path: file.path,
            metadata: file.metadata || []
        };
        return {
            files: files.concat(record),
        }
    } else {
        var oldRecord = state.files[idx];
        record = _.assign({}, oldRecord, {
            metadata: oldRecord.metadata.concat(file.metadata || [])
        });
        return {
            files: [].concat(
                files.slice(0, idx), record, files.slice(idx + 1)
            )
        };
    }
}

var lupa = streams.framework(
    reduceFileData, {files: []}
);

module.exports = {
    lupa: lupa,
    createLupa: function (initialState) {
        initialState = initialState || {files: []};
        var lupa = streams.framework(
            reduceFileData, initialState
        );
        return lupa;
    },
    reduceFileData: reduceFileData
};
