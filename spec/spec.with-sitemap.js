var path = require('path');
var expect = require('chai').expect;

var app = require(path.join(__dirname, '..', './app.js'));

describe('with-sitemap', function () {
  'use strict';

  it('exists', function () {
    expect(app).to.be.a('function');
  });

  it('does something', function () {
    expect(true).to.equal(false);
  });

  it('does something else', function () {
    expect(true).to.equal(false);
  });

  // Add more assertions here
});
