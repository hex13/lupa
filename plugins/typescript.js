"use strict";

const ts = require('typescript');


module.exports = function () {
    const host = {
        getScriptVersion: () => +new Date,
        getCompilationSettings: () => ({}),
        getCurrentDirectory: () => '',
        getScriptSnapshot: (path) => {
            return ts.ScriptSnapshot.fromString(cache['$' + path] || '');
        },
    };
    const cache = {

    };
    const langService = ts.createLanguageService(host);

    return function (f, enc, cb) {
        const code = f.contents.toString();
        const res = {path: f.path, contents: code};

        const lineLengths = code.split('\n').map(line => line.length);

        function getLoc(span) {
            let pos = span.start;
            const result = {};
            let chars = 0;
            for (var i = 0; i < lineLengths.length; i++) {
                const charsAtlineStart = chars;
                chars += lineLengths[i] + 1;

                if (chars > pos) {
                    if (!result.start) {
                        result.start = {
                                line: i + 1,
                                column: pos - charsAtlineStart,
                        };
                        pos += span.length;
                    }
                    else {
                        result.end = {
                                line: i + 1,
                                column: pos - charsAtlineStart,
                        };
                        return result;
                    }

                }
            }
        }

        cache['$' + f.path] = f.contents.toString();

        const navigationItems = langService.getNavigationBarItems(f.path);
        const globals = navigationItems.shift();
        navigationItems.unshift.apply(navigationItems, globals.childItems);
        navigationItems.sort((a, b) => a.spans[0].start - b.spans[0].start)

        const items = navigationItems.map(item => {
            let type = item.kind;
            switch (item.kind) {
                case 'var':
                case 'let':
                case 'const':
                    type = 'variableDeclaration'
                    break;
            }

            let res = {type: type, name: item.text};
            res.loc = getLoc(item.spans[0]);
            if (item.kind == 'interface' ) {
                res.properties = item.childItems.filter(
                    item => item.kind == 'property'
                ).map(item =>
                    ({type: 'property', name: item.text, loc: getLoc(item.spans[0])})
                );
            }

            if (item.kind == 'class' ) {
                res.functions = item.childItems.filter(
                    item => item.kind == 'method'
                ).map(item =>
                    ({type: 'function', name: item.text, loc: getLoc(item.spans[0])})
                );
            }
            return res;
        })
        items.forEach(item => {
            item.file = f;
        });
        res.metadata = items;
        cb(null, res);
    }
}
