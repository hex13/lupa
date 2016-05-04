// Note: this is NOT 100% ready plugin. And it will probably not show all routes in your routes.rb


function RailsRoutes() {
    return function (code) {
        var regex = /get *'(.*?)'/g;
        var match;
        var urls = [];
        while (match = regex.exec(code)) {
            urls.push({
                method: 'get',
                url: match[1]
            });
        }
        return {
            urls: urls
        };
    };
}

module.exports = RailsRoutes;