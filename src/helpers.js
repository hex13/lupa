const File = require('vinyl');

function readFileAsVinyl(path) {
    return new File({
        path: path,
        contents: require('fs').readFileSync(path)
    })
}

function cloneAndUpdate(obj, updates) {
    if (obj.clone && obj.clone.call) {
        var clone = obj.clone();
        return Object.assign(clone, updates);
    }
    return Object.assign({}, obj, updates);
}


module.exports = {
    readFileAsVinyl: readFileAsVinyl,
    cloneAndUpdate: cloneAndUpdate,
};
