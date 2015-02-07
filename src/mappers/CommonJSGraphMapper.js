function CommonJSGraphMapper (data) {
    var graph = Object.create(data);
    return data;
}

module.exports = function () {
    return CommonJSGraphMapper;
}
