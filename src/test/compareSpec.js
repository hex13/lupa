var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');


var lupa = require('../lupa');



describe('compare function', function () {

    it('should return correct object', function () {
        var data1 = ['cat', 'dog', 'cow', 'duck'];
        var data2 = ['dog', 'mouse', 'cat'];

        var result = lupa.compare(data1, data2);
        expect(result).to.exist();
        expect(result.both).to.have.property('length', 2);
        expect(result.both).to.include.members(['cat', 'dog']);

        expect(result.a).to.have.property('length', 2);
        expect(result.a).to.include.members(['cow', 'duck']);

        expect(result.b).to.have.property('length', 1);
        expect(result.b).to.include.members(['mouse']);
    });
});