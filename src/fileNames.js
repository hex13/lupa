function convertTemplate (tpl) {
    var variables = ['FULL_MATCH'];
    var reStr = '^' + tpl
            .replace(/\./g, '\\.')
            .replace(/\*/g, function (match) {
                variables.push('$' + variables.length);
                return '(.*)';
            })
            .replace(/:\w+/g, function (match) {
                var name = match.split(':')[1];
                var idx = variables.indexOf(name);
                if (idx == -1) {
                    variables.push(name);
                    return '([\\w-]+)'
                }
                return '\\' + idx;
            }) + '$';
    var reData = {
        vars: variables,
        re: reStr
    }

    function check (file) {
        var re = reData.re;
        var vars = reData.vars;
        var test = new RegExp(re, 'g').exec(file);
        if (test) {
            var data = test.reduce(function (dict, val, i) {
                var varName = vars[i];
                dict[varName] = val;
                return dict;
            }, {});

            return data;
        }
    }

    return check;
}

function renderTpl(tpl, data) {
    return tpl.replace(/:(\w+)/g, function (match, p1) {
        return data[p1];
    });
}

function matchFileName(file, paths) {
    var data;
    for (var i = 0; i < paths.length; i++) {
        var type = paths[i][0];
        var path = paths[i][1];
        data = convertTemplate(path)(file);
        if (data) {
            break;
        }
    }

    return data;
}

function renderPaths(paths, data, transforms) {
    if (!transforms) {
        transforms = {};
    }

    return paths.map(function (path) {
        var transform =  transforms[path[0]];
        return {
            type: path[0],
            path: renderTpl(
                path[1], typeof transform == 'function'? transform(data) : data
            )
        };
    });
}

function getRelatedFiles(file, paths, transforms) {
    var data = matchFileName(file, paths);

    if (data) {
        return renderPaths(paths, data, transforms);
    }
}



module.exports = {
    renderTpl: renderTpl,
    convertTemplate: convertTemplate,
    getRelatedFiles: getRelatedFiles
};
