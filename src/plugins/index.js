[
    'RailsRoutes',
    'RegExpDependencyPlugin',
    'RegExpPlugin',
    'Sass'
].forEach(function (name) {
    exports[name] = require('./' + name);
});
