//var helpers = require('./helpers');
// TODO this is copy-pasted function from './helpers' to avoid dependency.
function cloneAndUpdate(obj, updates) {
    if (obj.path) {

        // that's how it was done previously:
        // var clone = obj.clone();
        //
        // but we can't use vinyl's clone method because
        // vinyl's clone is deep
        // (painfully slow and unecessary in this case)
        // so we create new vinyl File instead
        var clone = {
            path: obj.path,
            contents: obj.contents,
        }
        return Object.assign(clone, obj, updates);
    }
    return Object.assign({}, obj, updates);
}
//------------------------------------

function getMetadata(file) {
   return file.metadata || [];
}

module.exports = {
    from: function (obj) {
        return Object.assign({}, obj);
    },
    findMetadata: function (file, params) {

    },
    getMetadata: getMetadata,
    addMetadata: function addMetadata(file, metadataToAdd) {
        var previousMetadata = file.metadata || [];
        return cloneAndUpdate(file, {
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
