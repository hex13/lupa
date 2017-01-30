"use strict";


const Rx = require('rx');
const spawn = require('child_process').spawn;
const Path = require('path');

//process.on('uncaughtException')


function plugin(file, enc, cb) {
    try {
    const script = Path.join(__dirname, 'python.py');
    let res;

    res = spawn('python', [script, file.path]);
    res.on('error', e => {
        return cb(file)
    })

    res.stdout.on('data', function (output) {
        const entities = JSON.parse(output);
        cb(null, Object.assign({}, file, {
            metadata: entities
        }));
    });
    } catch (e) {
        console.error("lupa:",  e);
    }
}
module.exports = plugin;
