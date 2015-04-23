
Lupa 0.0.25
====

Lupa is plugin based file analyser.


**Project is in active development**

`npm install --save lupa`


**How would you like use this library? API is still under development and you can help improve it.**

You can leave your suggestions [here](https://github.com/hex13/lupa/issues)

But one second. What is this all about? Well, overall workflow is like this:

1. read content of the file(s) with source code (html, css, js, sass etc.)   
2. pass code to parsers (done by regexps, mainly)
3. render parsed data (templating, e.g. Handlebars), write it to output file
4. open generated content (e.g. html file) and try to understand better your project, get some insights.


examples:

1.

```js
var lupa = require('lupa');
var code = fs.readFileSync('mixins.sass', 'utf8');
var parsedData = lupa.plugins.Sass(code);
console.log(parsedData);
```

2.

```js
var lupa = require('lupa');
var parsedData = lupa.helpers.parsePath('/Users/name/FancyProject/src/styles/*sass', 'Sass');
console.log(parsedData);
```

3.
    
```js
var lupa = require('lupa');
var output = lupa.file('config/routes.rb').analyze('RailsRoutes').render('urls');
console.log(output);
```
    
4.
    
```js
var lupa = require('lupa');
var output = lupa.file('config/routes.rb').analyze(lupa.plugins.RailsRoutes()).render('urls');
console.log(output);
```

API is gonna change like in all other JavaScript frameworks. **JavaScript ecosystem sucks** (this is reason why I don't like ExpressJS anymore and I often hear rants about Angular 2).
 But wait. This is version 0.0.25. Two zeros on beginning. And numbers of the stars on Github is zero. Nobody cares. I can change my framework any way I want. So... [how should it look?](https://github.com/hex13/lupa/issues) 
 
 