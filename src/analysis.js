
"use strict";

const Rx = require('rx');
const core = require('./core/core');
const createAnalysis = core.createAnalysis;
const compose = core.compose;
const helpers = require('./helpers');
const Metadata = require('./metadata');
const readFileAsVinyl = helpers.readFileAsVinyl;
const cloneAndUpdate = helpers.cloneAndUpdate;
const fileInfo = require('./plugins/FileInfo')();
const File = require('vinyl');
var glob = require("glob");
var fs = require("fs");
var utils = require('../plugins/utils');
var resolveModulePath = utils.resolveModulePath;


var parseCss = require('html-flavors').parseCss;


var Path = require('path');

var parse = require('../parsers/parsers')

var counter = 0;

var pluginData = {};

const ModulePlugin = require('../plugins/javascript');
let modulePlugin = ModulePlugin({
    namespaces: ['console']
});

const coffeePlugin = require('../plugins/coffeescript')

// @lupa labels: kotek, piesek
function getMappersFor(file) {
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
                            metadata: md.concat({name:'lines', data: [info.lines]}).concat(metadata),
                            ast: ast
                        })
                        observer.onNext(clone);
                    }
                )
            },
        ],
        '.js': [
            function (file) {
                return Rx.Observable.create(
                    observer => {
                        var md = file.metadata || [];
                        var info = fileInfo(file.contents + '', file.path);
                        var clone = cloneAndUpdate(file, {
                            metadata: md.concat({name:'lines', data: [info.lines]})
                        })
                        observer.onNext(clone);
                    }
                )
            },
            function getLabels (file) {
                return Rx.Observable.create(
                    observer => {
                        var code = file.contents.toString();
                        var labels = code.match(/\/\/ ?@lupa labels: (.*)/);
                        console.log("LABELS", labels);
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
            function getLabelsByRegexp (file) {
                return Rx.Observable.create(
                    observer => {
                        var code = file.contents.toString();
                        var regexps = pluginData.autolabels || [];
                        var labels = regexps.reduce((result, tuple) => (
                            code.match(tuple[1])? result.concat({
                                type: 'label',
                                data: tuple[0]
                            }) : result
                        ), []);

                        var clone = Metadata.addMetadata(file, labels);
                        observer.onNext(clone);


                    }
                )
            },
            function (file) {
                return Rx.Observable.create(
                    observer => {
                        modulePlugin(
                            file,
                            null,
                            (err, file) => observer.onNext(file)
                        )
                    }
                );
            },
        ]
    };
    mappers['.scss'] = mappers['.css'];
    mappers['.jsx'] = mappers['.js'];
    if (mappers.hasOwnProperty(ext)) {
        return mappers[ext];
    } else {
        console.error("not found plugins for ", ext)
    }
    return [];

}
var analysis = createAnalysis(
    file => {
        return getMappersFor(file).reduce(
            (result, mapper) => result.flatMap(mapper),
            Rx.Observable.return(parse(file))
        ).shareReplay();

    }
);


function onFileAnalyzed(o) {
    if (o.path.indexOf('chaining') != -1) {

    } else return;

    console.log(JSON.stringify((o.metadata || []).filter(a => a && a.data && a.data.length),0,2));
}

var files = new Rx.Subject;






files.subscribe(
    file => analysis.process(file).subscribe(onFileAnalyzed)
);





analysis.files = function () {
    return Rx.Observable.from(this.objects)
        .flatMap(v => v) // identity
        .take(this.objects.length);
        //.toArray();
}

analysis.indexProject = function (config) {
    if (config && typeof config == 'object') {
    } else if (Object.prototype.toString.call(config) == '[object String]') {
        try {
            var path = config;
            var stat = fs.statSync(path);
            if (stat.isDirectory()) {
                path = helpers.findInParentDirectories(path, 'lupaProject.json');
            }
            if (!path) throw new Error('Lupa: couldn\'t find config file for ' + config);
            config = JSON.parse(fs.readFileSync(path, 'utf8'));
            console.log("CONFIG FILE", config);
        } catch (e) {
            console.error('Lupa: couldn\'t parse config file.');
            throw e;
        }
    }
    config.namespaces = config.namespaces || ['module'];
    var globExpression = config.filePattern;
    pluginData.autolabels = config.autolabels;
    var configFileDir = Path.dirname(path);
    var root = configFileDir;

    modulePlugin = ModulePlugin(config);
    // assignment to `mg` is needed because we using `mg.cache`
    const mg = new glob.Glob(globExpression, {cwd: root}, function (err, filesAndDirectories) {

        var filePaths = filesAndDirectories
            .map(f => Path.resolve(root, f))
            .filter(f => mg.cache[f] == 'FILE');
        console.log("filePaths", filePaths);
        filePaths.forEach(path => files.onNext(readFileAsVinyl(path)))
    });
}

// TODO this is not full config
analysis.getConfig = () => pluginData;

analysis.filterFiles = function(filter) {
    return this.files().filter(filter);
}

analysis.findImporters = function(filename) {
    var filez = this.files();

    return filez.do(f => console.log('koko', f))
    .filter(f => {
        var imports = (f.metadata || [])
            .filter(n => n.type == 'import');
        console.log("IMPORTY", f.path, imports);
        return (imports.data || []).filter(item => item.source == filename).length;

        // return f.metadata
        //     .filter(item => item.type == 'import' && item.source == filename).length;
    });
}

//filez.connect();
module.exports = analysis;
//files.onNext(readFileAsVinyl('foo.js'));

// setTimeout(function () {
//     var objects = analysis.objects;
//     console.log(objects.length + ' files.', '----------------=--=-=---=-=-==-');
//     var result = Rx.Observable.from(objects)
//         .flatMap(v => v) // identity
//         .take(objects.length)
//         .toArray().subscribe(
//             a => {
//                 a.map(a => [a.path, a.metadata])
//                     .map(d => JSON.stringify(d,0,2))
//                     .forEach(d=>console.log(d))
//             }
//         );
//
//
// }, 3000)


// var files = Rx.Observable.create(observer => {
//     function nextFile(path)  {
//         const file = new File({
//             path: path,
//             contents: require('fs').readFileSync(path)
//         })
//         observer.onNext(file);
//     }
//
//     (function () {
//         const mg = new glob.Glob('**/*', function (err, filesAndDirectories) {
//             var files = filesAndDirectories.filter(f => mg.cache[f] == 'FILE');
//             files.forEach(nextFile)
//         });
//     })();
// });
