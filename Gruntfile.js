var child_process = require('child_process');
var fs = require('fs');

var lupa = require('./src/lupa');



module.exports = function (grunt) {
    grunt.initConfig({
    });


    grunt.registerTask('test', function () {
        var done = this.async();
        child_process.exec("mocha -c --recursive", {cwd: 'src'}, function (err, stdout) {
            console.log(stdout);
            done(!!!err);
        });
    });
};
