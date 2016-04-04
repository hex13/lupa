var _ = require('lodash');
var helpers = require('./helpers');

module.exports = {
    from: function (obj) {
        return _.assign({}, obj);
    },
    addMetadata: function addMetadata(file, metadataToAdd) {
        var previousMetadata = file.metadata || [];
        return helpers.cloneAndUpdate(file, {
            metadata: previousMetadata.concat(
                metadataToAdd.map(entry => Object.assign({}, entry, {name: entry.type || entry.name}))
            )
        });
    }
}
