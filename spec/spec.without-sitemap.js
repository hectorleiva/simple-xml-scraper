var path = require('path'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    expect = require('chai').expect;

  chai.use(chaiAsPromised);

var _fs = require(path.join(__dirname, '..', './filesystem.js'));
//var app = require(path.join(__dirname, '..', './app.js'));

describe('Filesystem', function () {
  'use strict';

  describe('Filesystem Object Set-up', function() {
    it('_fs is an object', function () {
      expect(_fs).be.an.instanceOf(Object);
    });
  });


  it('expect reading a non-existent directory to fail', function(done) {
    expect(_fs.readDir('non-existent-directory')).to.be.rejected.notify(done);
  });

  it('expect creating a test directory to pass', function() {
    var test = _fs.readDir('test_directory');
    test.then(function() {
      console.log('success');
    }, function() {
      console.log('failure');
    });
  });

});
