[
    'LOCPlugin',
    'RailsRoutes',
    'RegExpDependencyPlugin',
    'RegExpPlugin',
    'SizePlugin',
    'Sass'
].forEach(function (name) {
    exports[name] = require('./' + name);
});
