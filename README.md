
Lupa 0.0.17
====

Lupa is plugin based file analyser.


**Project is in active development**

`npm install --save lupa`


example:

    var lupa = require('lupa');
    var sassPlugin = lupa.plugins.Sass();


    var code = fs.readFileSync('mixins.sass');

    var parsedData = sassPlugin(code);

    console.log(parsedData);



