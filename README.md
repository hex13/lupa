
Lupa 0.0.18
====

Lupa is plugin based file analyser.


**Project is in active development**

`npm install --save lupa`


example:

    var lupa = require('lupa');
    var sassPlugin = lupa.plugins.Sass();


    var code = fs.readFileSync('mixins.sass', 'utf8');

    var parsedData = sassPlugin(code);

    console.log(parsedData);



