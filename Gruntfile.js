var child_process = require('child_process');

module.exports = function (grunt) {
    grunt.initConfig({
    });

    grunt.registerTask('test', function () {
        var done = this.async();
        child_process.exec("mocha -c", {cwd: 'src'}, function (err, stdout) {
            console.log(stdout);
            done(!!!err);
        });
    });
};
