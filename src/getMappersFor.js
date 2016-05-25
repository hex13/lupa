const Path = require('path');
const coffeePlugin = require('../plugins/coffeescript');
const Rx = require('rx');
const fileInfo = require('./plugins/FileInfo')();
var parseCss = require('html-flavors').parseCss;
const helpers = require('./helpers');
const cloneAndUpdate = helpers.cloneAndUpdate;
const Metadata = require('./metadata');
var getTodos = require('../plugins/todos');

module.exports = modulePlugin => function getMappersFor(file) {
    const ext = Path.extname(file.path);
    var mappers = {
        '.coffee': [
            coffeePlugin,
        ],
        '.css': [
            // TODO this is copy pasted from `.js`
            function (file) {
                return Rx.Observable.create(
                    observer => {
                        var metadata = [];
                        const onVisit = (node, originalNode) => {
                            if (node.type == '@mixin') {
                                metadata.push({
                                    name: '@mixin',
                                    type: '@mixin',
                                    source: node.source,
                                    data: [node.name]
                                });
                            }
                        }
                        var md = file.metadata || [];
                        var info = fileInfo(file.contents + '', file.path);
                        var ast = {
                            root: parseCss(file.contents + '', false, onVisit)
                        };
                        var clone = cloneAndUpdate(file, {
                            metadata: md.concat({type:'lines', data: [info.lines]}).concat(metadata),
                            ast: ast
                        })
                        observer.onNext(clone);
                    }
                )
            },
        ],
        '.js': [
            function getLabels (file) {
                return Rx.Observable.create(
                    observer => {
                        var code = file.contents.toString();
                        var labels = code.match(/\/\/ ?@lupa labels: (.*)/);

                        if (labels && labels[1]) {
                            var clone = Metadata.addMetadata(file,
                                labels[1]
                                    .split(',')
                                    .map(l => l.trim())
                                    .map(l => ({
                                        type: 'label',
                                        data: l
                                    }))
                            )
                            observer.onNext(clone);
                        } else observer.onNext(file);

                    }
                )
            },
            getTodos,
            // function getLabelsByRegexp (file) {
            //     return Rx.Observable.create(
            //         observer => {
            //             var code = file.contents.toString();
            //             var regexps = pluginData.autolabels || [];
            //             var labels = regexps.reduce((result, tuple) => (
            //                 code.match(tuple[1])? result.concat({
            //                     type: 'label',
            //                     data: tuple[0]
            //                 }) : result
            //             ), []);
            //
            //             var clone = Metadata.addMetadata(file, labels);
            //             observer.onNext(clone);
            //
            //
            //         }
            //     )
            // },
            function (file) {
                return Rx.Observable.create(
                    observer => {
                        modulePlugin(
                            file,
                            null,
                            (err, file1) => {
                                observer.onNext(file1)
                                file1.ast = null;
                                file.ast = null;
                            }
                        )
                    }
                );
            },
        ]
    };
    mappers['.scss'] = mappers['.css'];
    mappers['.jsx'] = mappers['.js'];
    function linePlugin(file) {
        const _linePlugin = callback => {
            var info = fileInfo(file.contents + '', file.path);
            var clone = Metadata.addMetadata(
                file, [{type:'lines', data: [info.lines]}]
            );
            callback(clone);
        }
        return Rx.Observable.fromCallback(_linePlugin)();
    }

    if (mappers.hasOwnProperty(ext)) {
        return mappers[ext].concat(linePlugin);
    } else {
        console.error("not found plugins for ", ext)
    }
    return [];

}
