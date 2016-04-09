//const Rx = require('rx');
"use strict";

function createCache(getKey) {
    const cache = {};
    cache.delete = function (context) {
        var key = getKey(context);
        this['$' + key] = null;
    }
    cache.getOrCreate = function (context, create) {
        var key = getKey(context);
        return this['$' + key] || (this['$' + key] = create());
    }
    cache.all = function () {
        return Object.keys(cache)
            .filter(k => k.charAt(0) === '$')
            .map(k => cache[k]);
    }
    return cache;
}

function createAnalysis(analyzeObject) {
    const cache = createCache(obj => obj.path);
    return {
        invalidate: function invalidate(obj) {
            cache.delete(obj);
        },
        process: function process(obj) {
            const create = () => analyzeObject(obj);
            return cache.getOrCreate(obj, create);
        },
        get objects() {
            return cache.all();
        }
    }
}

// helpers

function compose(funcs) {
    return funcs.reduce.bind(funcs, (res, f) => {
        return f(res);
    })
}


exports.createAnalysis = createAnalysis;
exports.compose = compose;
