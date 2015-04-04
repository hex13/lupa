[
    'LOCPlugin',
    'RegExpDependencyPlugin',
    'RegExpPlugin',
    'SizePlugin'
].forEach(function (name) {
    exports[name] = require('./' + name);
});
