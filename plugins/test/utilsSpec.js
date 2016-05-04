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
        expect(getName(null)).to.equal('');
        expect(getName(false)).to.equal('');
        expect(getName('')).to.equal('');
        expect(getName(undefined)).to.equal('');

    });
});

describe('analyzeChain', function () {
    // TODO remove it or refactor
    // this is legacy unit test and specification has changed
    it('should return list of angular directives', function () {
        var code = fs.readFileSync('../src/mocks/chaining.js', 'utf8');
        var ast = parser.parse(code, {sourceType: 'module', loc: true});
        var body = ast.body;
        var chains = unwrapIIFEs(body)
            .map(analyzeChain)
            .filter(function (ch) {return ch[0].name == 'angular'});
        //console.log(JSON.stringify(chains,0,2));
        expect(chains.length).equal(1);

        var chain = chains[0];
        expect(chain).to.have.property('length', 5);
        expect(chain).to.have.deep.property('[0].name', 'angular');
        expect(chain).to.have.deep.property('[1].name', 'module');

        var moduleParams = chain[1].arguments;
        expect(moduleParams).to.have.deep.property('[0].value', 'Something');
        expect(moduleParams).to.have.deep.property('[0].loc');
        expect(moduleParams).to.have.deep.property('[1].value').equal(['dep1', 'dep2', 'dep3']);
        expect(moduleParams).to.have.deep.property('[1].loc');

        expect(chain).to.have.deep.property('[2].name', 'directive');
        expect(chain).to.have.deep.property('[3].name', 'directive');
        expect(chain).to.have.deep.property('[4].name', 'service');

        chain.forEach(function (part, i) {
            describe('chain[' + i + ']',function () {
                it('should have loc information', function () {
                    expect(part).to.have.property('loc');
                    expect(part).to.have.deep.property('loc.start.line');
                });
            });
        });

        var angularInfo = getAngularInfoFromChains([chain]);
        var modules = angularInfo.filter(function (item){ return item.type == 'angularModule' });
        expect(modules.length).to.equal(1);
        expect(modules[0]).to.have.property('name', 'Something');
        expect(modules[0]).to.have.property('loc');
        expect(modules[0]).to.have.deep.property('loc.start.line');


        var directives = angularInfo.filter(
            function (item){ return item.type == 'directive'
        });
        expect(directives).to.have.deep.property('[0].name', 'SomeDirective');
        expect(directives).to.have.deep.property('[1].name', 'OtherDirective');

        var services = angularInfo.filter(
            function (item){ return item.type == 'service'
        });
        expect(services).to.have.deep.property('[0].name', 'SomeService');

        directives.concat(services).forEach(function (item) {
            expect(item).have.property('loc');
            expect(item).have.deep.property('loc.start.line');
        })




        // var directives = angularInfo.filter(
        //     function (item){ return item.name == 'directives'
        // })[0];
        // expect(directives.data).to.have.deep.property('[0].name', 'SomeDirective');
        // expect(directives.data).to.have.deep.property('[1].name', 'OtherDirective');
        //
        // var services = angularInfo.filter(
        //     function (item){ return item.name == 'services'
        // })[0];
        // expect(services.data).to.have.deep.property('[0].name', 'SomeService');


        //var result = getAngularInfoFromChains(chains);


        //
        // expect(modules).to.deep.equal(['Something']);
        // expect(deps.map(function(d){
        //     return d;//.data
        // })).to.deep.equal(['dep1', 'dep2', 'dep3']);
        // expect(directives).to.deep.equal(['SomeDirective', 'OtherDirective']);
        // expect(services).to.deep.equal(['SomeService']);
    });
});
