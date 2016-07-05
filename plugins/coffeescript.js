"use strict";
const Metadata = require('../src/metadata');
var utils = require('./utils');
var resolveModulePath = utils.resolveModulePath;

module.exports = function plugin(file, enc, cb) {
    var code = file.contents.toString();
    var lines = code.split('\n');
    var requires = [], classes = [], functions = [];
    lines.forEach( (line, i) => {
        let match;
        const reCoffeeRequire = /(([\w{} ,]+) = require *\(? *["'](.*)['"])|(\s*#)/;
        match = line.match(reCoffeeRequire);
        if (match && !match[4]) {
            var originalSource = match[3];
            var variable = match[2];
            var source = resolveModulePath(file.path, originalSource);
            requires.push({
                type: 'import',
                name: variable,
                source: source,
                originalSource: originalSource
            });
        }

        const reCoffeeClass = /class +(\w+)/;
        match = line.match(reCoffeeClass);
        if (match) {
            classes.push({
                type: 'class',
                name: match[1],
                superClass: {
                    name: '',
                },
                loc: {
                    start: {column: 0, line: i + 1},
                    end: {column: 0, line: i + 2}
                },
            });
        }

        const reCoffeeFunction = /(\w+)?( *[=:] *.*)?->/;
        match = line.match(reCoffeeFunction);
        if (match) {
            functions.push({
                type: 'function',
                name: match[1] || '',
                params: [],
                loc: {
                    start: {column: 0, line: i +1},
                    end: {column: 0, line: i + 2}
                },
            });
        }

    });
    const md = requires.concat(classes, functions);
    var clone = Metadata.addMetadata(file, md);
    cb(null, clone)
}
