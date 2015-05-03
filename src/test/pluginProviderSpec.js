var fs = require('fs');

var chai = require('chai');
var lupa = require('../lupa');


var expect = chai.expect;

var pluginProvider = require('../PluginProvider')(lupa.plugins);

var plugins = lupa.plugins;


describe("PluginProvider", function () {
    it('should include RailsRoutes plugin', function () {
        var ext = pluginProvider('routes.rb');
        expect(ext).to.be.instanceof(Array).and.include(plugins.RailsRoutes);
    });
    it('should return empty array', function () {
        var ext = pluginProvider('routes.non-existent');
        expect(ext).to.be.instanceof(Array).and.have.property('length').equal(0);
    });
});
