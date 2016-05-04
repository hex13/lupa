var fs = require('fs');

function File(path_) {
    return {
        path: path_,
        read: function () {
            return fs.readFileSync(path_, 'utf8');
        }
    };
};

module.exports = File;