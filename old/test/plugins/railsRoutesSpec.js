var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var _ = require('lodash');

var lupa = require('../../lupa');
var RoutesPlugin = lupa.plugins.RailsRoutes;

describe('Rails Routes Plugin', function () {
    beforeEach(function () {
        this.routesPlugin = RoutesPlugin();
    });


    it('should return array of urls', function () {
        var code = fs.readFileSync('../src/mocks/routes.rb');
        var data = this.routesPlugin(code);
        expect(data).to.exist()
            .and.have.property('urls')
                .to.be.instanceof(Array)
                .and.have.property('length').equal(7);


        var urls = data.urls.map(function (item) {
            return item.url;
        });
        expect(urls).to.include('activities');
        expect(urls).to.include('admin');
        expect(urls).to.include('login');
        expect(urls).to.include('profile');
        expect(urls).to.include('signup');
        expect(urls).to.include('/home/options');
        expect(urls).to.include('/home/toggle');
    });
});
