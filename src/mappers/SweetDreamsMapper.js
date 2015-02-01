module.exports = function (data) {
    // example mapper
    for (var a in data) {
        data[a].customMapper = 'sweet dreams';
    }
    return data;
}
