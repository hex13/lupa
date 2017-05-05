"use strict";

//process.on('uncaughtException')

const jsm = require('json-source-map');
function plugin(file, enc, cb) {
    try {
        const contents = file.contents.toString();
        const data = jsm.parse(contents);

        const lengths = contents.split('\n').map(line => line.length + 1);
        const metadata = Object.keys(data.pointers).map(name => {
            const parts = name.split('/');

            const jsParts = parts.map(key => {
                if (!key)
                    return '';
                if (key.match(/^\d+$/))
                    return `[${key}]`;
                if (key.match(/[ -]/))
                    return `['${key}']`;
                return '.' + key;
            });
            const p = data.pointers[name];

            const pos = p.valueEnd.pos;
            let n = 0;
            let left = pos;
            let line = -1, column;
            do {
                line++;
                left -= lengths[line];
            } while (line < (lengths.length - 1) && left > 0);
            column = left + lengths[line];


            return {
                type: 'jsonItem',
                name: jsParts.join(''),
                level: jsParts.length,
                basename: jsParts[jsParts.length - 1],
                loc: {
                    start: {
                        line: (p.key || p.value).line + 1,
                        column: (p.key || p.value).column
                    },
                    end: {
                        line: line + 1, //p.valueEnd.line + 1,
                        column: column, //p.valueEnd.column
                    }
                }
            };
        });
        cb(null, Object.assign({}, file, {
            metadata
        }));
    } catch (e) {
        console.error("lupa:",  e);
    }
}
module.exports = () => plugin;
