function GraphMapper (data) {
    var graph = Object.create(data);
    // TODO this is pretty naive approach. It may cause infinite recurrency
    // if there were cyclomatic dependencies in project.

    for (var name in graph) {
        graph[name] = graph[name].map(function (name) {
            return [name, graph[name]];
        });
    }
    return graph;
}

module.exports = function () {
    return GraphMapper;
}
