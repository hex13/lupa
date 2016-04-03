const Rx = require('rx');
const core = require('./core/core');
const createAnalysis = core.createAnalysis;
const compose = core.compose;
const cloneAndUpdate = core.cloneAndUpdate;
const helpers = require('./helpers');
const readFileAsVinyl = helpers.readFileAsVinyl;
const modulePlugin = require('../plugins/React/components').getComponents;
const fileInfo = require('./plugins/FileInfo')();
const File = require('vinyl');
var glob = require("glob");
var fs = require("fs");

var Path = require('path');

var parse = require('../parsers/parsers')

var counter = 0;

var pluginData = {};



function getMappersFor(file) {
    const ext = Path.extname(file.path);
    var mappers = {
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
                        var md = file.metadata || [];
                        var code = file.contents.toString();
                        var labels = code.match(/\/\/ ?@lupa labels: (.*)/);
                        console.log("LABELS", labels);
                        if (labels && labels[1]) {
                            var clone = cloneAndUpdate(file, {
                                metadata: md.concat(
                                    labels[1]
                                        .split(',')
                                        .map(l => l.trim())
                                        .map(l => ({
                                            name: 'label',
                                            data: l
                                        }))
                                )
                            })
                            observer.onNext(clone);
                        } else observer.onNext(file);

                    }
                )
            },
            function getLabelsByRegexp (file) {
                return Rx.Observable.create(
                    observer => {
                        var md = file.metadata || [];
                        var code = file.contents.toString();
                        var regexps = pluginData.autolabels || [];
                        var labels = regexps.reduce((result, tuple) => (
                            code.match(tuple[1])? result.concat({
                                name: 'label',
                                data: tuple[0]
                            }) : result
                        ), []);

                        var clone = cloneAndUpdate(file, {
                            metadata: md.concat(labels)
                        })
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
    if (mappers.hasOwnProperty(ext)) {
        return mappers[ext];
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
        console.log("RESULTAT", o.path, o.metadata);
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
                path = searchConfig(path);
            }
            function searchConfig(path) {
                var filename = Path.join(path, 'lupaProject.json');
                if (fs.existsSync(filename))
                    return filename;
                else return searchConfig(Path.resolve(path, '..'));
            }
            config = JSON.parse(fs.readFileSync(path, 'utf8'));
            console.log("CONFIG FILE", config);
        } catch (e) {
            console.error('Lupa: couldn\'t parse config file');
            throw e;
        }
    }
    var globExpression = config.filePattern;
    pluginData.autolabels = config.autolabels;
    var configFileDir = Path.dirname(path);
    console.log("configFileDir", configFileDir)
    var root = configFileDir;
    // assignment to `mg` is needed because we using `mg.cache`
    const mg = new glob.Glob(globExpression, {cwd: root}, function (err, filesAndDirectories) {

        var filePaths = filesAndDirectories
            .map(f => Path.resolve(root, f))
            .filter(f => mg.cache[f] == 'FILE');
        console.log("filePaths", filePaths);
        filePaths.forEach(path => files.onNext(readFileAsVinyl(path)))
    });
}

analysis.filterFiles = function(filter) {
    return this.files().filter(filter);
}

analysis.findImporters = function(filename) {
    var filez = this.files();

    return filez.do(f => console.log('koko', f))
    .filter(f => {
        var imports = (f.metadata || [])
            .filter(n => n.name == 'imports')[0] || {};
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