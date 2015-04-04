function convertTemplate (tpl) {
    var variables = ['FULL_MATCH'];
    var reStr = '^' + tpl
            .replace(/\./g, '\\.')
            .replace(/:\w+/g, function (match) {
                var name = match.split(':')[1];
                var idx = variables.indexOf(name);
                if (idx == -1) {
                    variables.push(name);
                    return '(\\w+)'
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
    var str = tpl.replace(/:(\w+)/g, function (match, p1) {
        return data[p1];
    });
}

module.exports = {
    renderTpl: renderTpl,
    convertTemplate: convertTemplate
};
