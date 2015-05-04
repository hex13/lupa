var parsePath = require('./fileNames2').parsePathTemplate;


module.exports = function ObjectFileMapper () {
    return function (filename, template) {
        // TODO this pattern is just an example pattern
        var variables = parsePath('*/{{ dir }}/{{ name }}.rb')(filename);
        return variables.dir + '.' + variables.name;
    };
};