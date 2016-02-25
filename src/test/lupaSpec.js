var chai = require('chai');
var expect = chai.expect;

var lupaStreams = require('../lupaStreams');
var reduceFileData = lupaStreams.reduceFileData;

describe("reduceFileData", function () {
    it('should merge metadata from file objects', function () {
        var state = {
            files: []
        };
        var mocks = [
            {
                path: './foo/animals',
                metadata: [
                    'cat'
                ]
            },
            {
                path: './foo/animals',
                metadata: [
                    'dog'
                ]
            },
            {
                path: './things',
                metadata: [
                    'computer'
                ]
            }
        ];

        var res = mocks.reduce(reduceFileData, {
            files: []
        });

        expect(res.files).to.include({
            path: './foo/animals',
            metadata: [
                'cat', 'dog'
            ]
        });
        expect(res.files).to.include({
            path: './things',
            metadata: [
                'computer'
            ]
        });

    });
});
