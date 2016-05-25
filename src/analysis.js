"use strict";

const Rx = require('rx');
const core = require('./core/core');
const createAnalysis = core.createAnalysis;
const compose = core.compose;
const helpers = require('./helpers');
const readFileAsVinyl = helpers.readFileAsVinyl;
const File = require('vinyl');
var glob = require("glob");
var fs = require("fs");
var utils = require('../plugins/utils');
var resolveModulePath = utils.resolveModulePath;
const getMappersFor = require('./getMappersFor');





var Path = require('path');

var parse = require('../parsers/parsers')

var counter = 0;

var pluginData = {};

const ModulePlugin = require('../plugins/javascript');
let modulePlugin = ModulePlugin({
    namespaces: ['console']
});


// @lupa labels: kotek, piesek

var analysis = createAnalysis(
    file => {
        return getMappersFor(modulePlugin)(file).reduce(
            (result, mapper) => result.flatMap(mapper),
            Rx.Observable.return(parse(file))
        ).shareReplay();

    }
);
analysis.indexing = new Rx.Subject;

var filesLeft = 0;
function onFileAnalyzed(o) {
    filesLeft--;
    //console.log("files left: " + filesLeft);
    if (!filesLeft) {
        analysis.files().toArray().subscribe(files => {
            analysis.indexing.onNext(files);
        })
    }
    if (o.path.indexOf('chaining') != -1) {

    } else return;
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
            .filter(f => {
                return mg.cache[f] == 'FILE' || fs.lstatSync(f).isFile();
            });
        filesLeft += filePaths.length;
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

    return filez
    .filter(f => {
        var imports = (f.metadata || [])
            .filter(n => n.type == 'import');
        return imports.filter(item => item.source == filename).length;

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
