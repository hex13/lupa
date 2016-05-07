var _ = require('lodash');
var helpers = require('./helpers');

function getMetadata(file) {
   return file.metadata || [];
}

module.exports = {
    from: function (obj) {
        return _.assign({}, obj);
    },
    findMetadata: function (file, params) {

    },
    getMetadata: getMetadata,
    addMetadata: function addMetadata(file, metadataToAdd) {
        var previousMetadata = file.metadata || [];
        return helpers.cloneAndUpdate(file, {
            metadata: previousMetadata.concat(
                metadataToAdd.map(entry => Object.assign(
                    {},
                    entry,
                    {type: entry.type || entry.name},
                    {file: file}
                ))
            )
        });
    }
}
