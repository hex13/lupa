const File = require('vinyl');

function readFileAsVinyl(path) {
    return new File({
        path: path,
        contents: require('fs').readFileSync(path)
    })
}

function cloneAndUpdate(obj, updates) {
    if (File.isVinyl(obj)) {

        // that's how it was done previously:
        // var clone = obj.clone();
        //
        // but we can't use vinyl's clone method because
        // vinyl's clone is deep
        // (painfully slow and unecessary in this case)
        // so we create new vinyl File instead
        var clone = new File({
            path: obj.path,
            contents: obj.contents
        });
        return Object.assign(clone, obj, updates);
    }
    return Object.assign({}, obj, updates);
}


module.exports = {
    readFileAsVinyl: readFileAsVinyl,
    cloneAndUpdate: cloneAndUpdate,
};
