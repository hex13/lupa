const Rx = require('rx');
const core = require('./core/core');
const createAnalysis = core.createAnalysis;
const compose = core.compose;
const cloneAndUpdate = core.cloneAndUpdate;
const modulePlugin = require('../plugins/React/components').getComponents;
const File = require('vinyl');
var glob = require("glob");

var Path = require('path');

var parse = require('../parsers/parsers')

var counter = 0;

function getMappersFor(file) {
    const ext = Path.extname(file.path);
    var mappers = {
        '.js': [
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

function readFileAsVinyl(path) {
    return new File({
        path: path,
        contents: require('fs').readFileSync(path)
    })
}




files.subscribe(
    file => analysis.process(file).subscribe(onFileAnalyzed)
);


analysis.files = function () {
    return Rx.Observable.from(this.objects)
        .flatMap(v => v) // identity
        .take(this.objects.length);
        //.toArray();
}

analysis.indexProject = function (globExpression) {
    // assignment to `mg` is needed because we using `mg.cache`
    const mg = new glob.Glob(globExpression, function (err, filesAndDirectories) {
        var filePaths = filesAndDirectories.filter(f => mg.cache[f] == 'FILE');
        filePaths.forEach(path => files.onNext(readFileAsVinyl(path)))
    });
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
