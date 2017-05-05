const Path = require('path');
const coffeePlugin = require('../plugins/coffeescript');
const typeScriptPlugin = require('../plugins/typescript')();
const Rx = require('rx');
const fileInfo = require('./plugins/FileInfo')();
var parseCss = require('html-flavors').parseCss;
const helpers = require('./helpers');
const cloneAndUpdate = helpers.cloneAndUpdate;
const Metadata = require('./metadata');
var getTodos = require('../plugins/todos');
const pythonPlugin = require('../plugins/python.js');
const jsonPlugin = require('../plugins/json.js')();

const mapperCache = new Map;
module.exports = modulePlugin => function getMappersFor(file) {
    const ext = Path.extname(file.path);
    if (mapperCache.get(ext)) {
        return mapperCache.get(ext);
    }
    var mappers = {
        '.ts': [
            file => Rx.Observable.fromNodeCallback(typeScriptPlugin)(file, null)
        ],
        '.json': [
            file => Rx.Observable.fromNodeCallback(jsonPlugin)(file, null)
        ],
        '.py': [
            Rx.Observable.fromNodeCallback(pythonPlugin)(file, null)
        ],
        '.coffee': [
            Rx.Observable.fromNodeCallback(coffeePlugin)(file, null)
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
                        var ast;
                        try {
                            ast = {
                                root: parseCss(file.contents + '', false, onVisit)
                            };
                        } catch (e) {
                            ast = {
                                root: {}
                            }
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
            // function getLabels (file) {
            //     return Rx.Observable.create(
            //         observer => {
            //             var code = file.contents.toString();
            //             var labels = code.match(/\/\/ ?@lupa labels: (.*)/);
            //
            //             if (labels && labels[1]) {
            //                 var clone = Metadata.addMetadata(file,
            //                     labels[1]
            //                         .split(',')
            //                         .map(l => l.trim())
            //                         .map(l => ({
            //                             type: 'label',
            //                             data: l
            //                         }))
            //                 )
            //                 observer.onNext(clone);
            //             } else observer.onNext(file);
            //
            //         }
            //     )
            // },
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
                return Rx.Observable.fromNodeCallback(modulePlugin)(file, null);
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

    let res;
    if (mappers.hasOwnProperty(ext)) {
        res = mappers[ext].concat(linePlugin);
    } else {
        res = [linePlugin];
    }
    mapperCache.set(ext, res);
    return res;
}
