var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
const plugin = require('../python.js');
const Path = require('path');

describe('Python plugin', () => {
    it('should return correct entities', (done) => {
        const path = Path.join(__dirname, '../mocks/python-mock.py');
        plugin({
            path: path
        }, null, (err, f) => {
            expect(f).to.have.property('metadata');
            expect(f).to.have.property('path', path);
            expect(f).to.have.deep.property('metadata.length', 5);
            expect(f.metadata.filter(m => m.name == 'Foo').length).to.equal(1);
            expect(f.metadata.filter(m => m.name == 'meth1').length).to.equal(1);
            expect(f.metadata.filter(m => m.name == 'meth2').length).to.equal(1);
            expect(f.metadata.filter(m => m.name == 'nested').length).to.equal(1);
            expect(f.metadata.filter(m => m.name == 'whatever').length).to.equal(1);
            done();
        });
    });
});
