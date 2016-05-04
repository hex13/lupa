// Do not use this module in production code. This for tests only.

function TestAnimals () {
    return function (code) {
        return {
            testAnimals: ['cat', 'dog', 'mouse', 'kangaroo'],
            testAnimals_code: code
        };
    };
}

module.exports = TestAnimals;