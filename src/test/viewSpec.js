var fs = require('fs');

var chai = require('chai');
var lupa = require('../lupa');
var Handlebars = require('Handlebars');
var _ = require('lodash');


var expect = chai.expect;

describe('view', function () {
    beforeEach(function () {
        this.view = lupa.View();
        this.data = {
            animal: 'Squirrel',
            food: 'peanuts'
        };

        this.view.registerTemplateEngine('handlebars', function (tpl) {
            return Handlebars.compile(tpl);
        });

        this.view.registerTemplateEngine('lodash', function (tpl) {
            return _.template(tpl);
        });
    });

    it('should be function', function () {
        expect(this.view).to.be.instanceof(Function);
    });


    it('should return rendered view', function () {

        this.view.registerTemplate('animals', 'animals.html.handlebars');
        this.view.registerTemplate('lodash', 'animals.html.lodash');


        expect(this.view('animals', this.data)).to.equal('Squirrel likes peanuts.\n');
        expect(this.view('lodash', this.data)).to.equal('Squirrel likes peanuts xD\n');

    });

    it('should render urls template', function () {
        var data= {
            urls: [
                {
                    url: 'http://google.com',
                    name: 'Google'
                }
            ]
        };

        this.view.registerTemplate('urls', 'urls.html.handlebars');
        expect(this.view('urls', data)).to.be.a('string').and.have.property('length').to.be.above(0);
    });

});
