var parsePath = require('./fileNames2').parsePathTemplate;


module.exports = function ObjectFileMapper () {
    return function (filename, template) {
        // TODO this pattern is just an example pattern
        var variables = parsePath(template)(filename);
        return variables.name;
    };
};