var path = require('path'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    expect = require('chai').expect;

  chai.use(chaiAsPromised);

var _fs = require(path.join(__dirname, '..', './filesystem.js'));
var crawler = require(path.join(__dirname, '..', './crawler.js'));

describe('Crawler Application', function () {
  'use strict';

  describe('Filesystem', function() {
    it('_fs is an object', function () {
      expect(_fs).be.an.instanceOf(Object);
    });

    it('_fs has a readDir method', function() {
      expect(_fs.readDir).be.an.instanceOf(Object);
    });

    it('_fs has a mkDir method', function() {
      expect(_fs.mkDir).be.an.instanceOf(Object);
    });

    it('_fs has a mkFile method', function() {
      expect(_fs.mkFile).be.an.instanceOf(Object);
    });

    it('expect reading a non-existent directory to fail', function(done) {
      expect(_fs.readDir('non-existent-directory')).to.be.rejected.notify(done);
    });

    it('expect creating a test directory to pass', function(done) {
      expect(_fs.mkDir('test_directory')).to.be.fulfilled.notify(done);
    });
  });

  describe('Crawler Object', function() {
    it('Crawler is an Object', function() {
      expect(crawler).be.an.instanceOf(Object);
    });
  });

});

