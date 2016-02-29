var chai = require('chai');
var expect = chai.expect;
var parser = require('esprima-fb');
var objectExpressionToJS = require('../utils').objectExpressionToJS;

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
