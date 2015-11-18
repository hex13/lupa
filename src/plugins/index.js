[
    'ES6ModuleInfo',
    'FileInfo',
    'Haml',
    'Html',
    'RailsRoutes',
    'Sass',
    'TestAnimals',

].forEach(function (name) {
    exports[name] = require('./' + name);
});
