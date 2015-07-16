
Lupa 0.0.40
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

```js
var lupa = require('lupa');
var code = fs.readFileSync('mixins.sass', 'utf8');
var parsedData = lupa.plugins.Sass(code);
console.log(parsedData);
```
 
```js
var lupa = require('lupa');
var code = fs.readFileSync('index.haml', 'utf8');
var parsedData = lupa.plugins.Haml(code);
console.log(parsedData);
```
