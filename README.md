
Lupa 🔍
====

Lupa is plugin based analyser for JavaScript projects.

**This is a backend for Atom package. Check this: https://atom.io/packages/atom-lupa **

![atom screenshot](https://raw.githubusercontent.com/hex13/atom-lupa/master/screenshot-1.png)


`npm install --save lupa`

**Project is still under development and API is unstable. It's not production ready yet. But keep watching **

You can leave your suggestions [here](https://github.com/hex13/lupa/issues)

But one second. What is this all about? Well, overall workflow is like this:


```js
const mockRoot = '../mocks/exampleProject');

analysis.indexProject(mockRoot)
analysis.indexing.subscribe(function (files) {
   files.forEach(function (f) {
       console.log('PATH:',f.path);
       console.log('METADATA:',f.metadata);
   });

});
```
