"use strict";

const Rx = require('rx');
const spawn = require('child_process').spawn;
const Path = require('path');

//process.on('uncaughtException')

function plugin(file, cb) {
    const script = Path.join(__dirname, 'python.py');
    let res;

    res = spawn('python', [script, file.path]);
    res.on('error', e => cb(file))

    res.stdout.on('data', function (output) {
        const entities = JSON.parse(output);
        cb(Object.assign({}, file, {
            metadata: entities
        }));
    });

}
module.exports = function pythonPlugin(file) {
    return Rx.Observable.fromCallback(plugin)(file);
}
