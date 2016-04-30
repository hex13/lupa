"use strict";

const cheerio = require('cheerio');
var addMetadata = require('../src/metadata').addMetadata;

module.exports = function () {
    return function plugin(file, enc, cb) {
        const $ = cheerio.load(file.contents + '');
        const hrefs = [];
        const r = $('link').each((i, link) => {
            hrefs.push($(link).attr('href'));
        })

        const metadata = hrefs.map(
            href => ({
                type: 'linkCss',
                href: href
            })
        );
        cb(null, addMetadata(file, metadata));
    }
}
