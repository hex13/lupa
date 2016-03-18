var chai = require('chai');
var expect = chai.expect;
var parser = require('esprima-fb');
var utils = require('../utils');
var objectExpressionToJS = utils.objectExpressionToJS;
var getName = utils.getName;
var analyzeChain = utils.analyzeChain;
var unwrapIIFEs = utils.unwrapIIFEs;
var getAngularInfoFromChains = utils.getAngularInfoFromChains;
var fs = require('fs');

// TODO support for arrays
var codeThatDoesntWorkYet = '({animals: ["cat", "dog"], whatever: 123})';
// TODO support for string literals as keys
var otherCodeThatDoesntWork = '({"animals": ["cat", "dog"], whatever: 123})';

var code = '({animal1: "cat", animal2:"dog", amount: 2})';
var ast = parser.parse(code);

describe('objectExpressionToJS', function () {
    it('should parse identifier keys and values with string or number', function () {
        var expr = ast.body[0].expression;
        var obj = objectExpressionToJS(expr);
        var keys = Object.keys(obj);
        var values = keys.map(function(k){ return obj[k]; });
        expect(keys).to.deep.equal(['animal1', 'animal2', 'amount']);
        expect(values).to.deep.equal(['cat', 'dog', 2]);
    });
});


describe('getName', function () {
    it('should return name of  identifier keys and values with string or number', function () {
        var data = [
            {code: 'var abc = 1', name: 'abc'},
            {code: 'const abcd = 1', name: 'abcd'},
            {code: 'let abcdef = 1', name: 'abcdef'},
            {code: 'function foo () {}', name: 'foo'},
            // TODO it doesn't work yet
            // {code: 'bar()', name: 'bar'},
            {code: '"kotek"', name: 'kotek'},
            {code: "'piesek'", name: 'piesek'},
            // {code: 'def = 10', name: 'de'},
        ];
        data.forEach(function (dataset) {
            var ast = parser.parse(dataset.code);
            var node = ast.body[0];
            var name = getName(node);
            expect(name).to.equal(dataset.name);
        });

    });
});

describe('analyzeChain', function () {
    it('should return list of angular directives', function () {
        var code = fs.readFileSync('../src/mocks/chaining.js', 'utf8');
        var ast = parser.parse(code, {sourceType: 'module'});
        var body = ast.body;
        var chains = unwrapIIFEs(body)
            .map(analyzeChain)
            .filter(function (ch) {return ch[0] == 'angular'});

        var result = getAngularInfoFromChains(chains);

        var modules = result.filter(function (d) {
            return d.name == 'modules'
        })[0].data;

        var deps = result.filter(function (d) {
            return d.name == 'dependencies'
        })[0].data;

        var directives = result.filter(function (d) {
            return d.name == 'directives'
        })[0].data;


        expect(modules).to.deep.equal(['Something']);
        expect(deps.map(function(d){
            return d.data
        })).to.deep.equal(['dep1', 'dep2', 'dep3']);
        expect(directives).to.deep.equal(['SomeDirective', 'OtherDirective']);
    });
});
