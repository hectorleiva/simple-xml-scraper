'use strict';

var Q         = require('q'),
    fs        = require('fs'),
    writeFile = Q.denodeify(fs.writeFile),
    readDir   = Q.denodeify(fs.readdir),
    mkdir     = Q.denodeify(fs.mkdir),
    delDir    = Q.denodeify(fs.rmdir);

var Filesystem = {
  mkDir: function(folder, dir_perm, file_path, file_body) {
    var deferred = Q.defer();

    readDir(folder)
      .then(function(folder, dir_perm) {
        deferred.resolve(file_path, file_body);
        //  Successfully read the directory
      }, function(folder) {
        mkdir(folder.path, dir_perm)
          .then(function() {
            deferred.resolve(file_path, file_body);
            console.log('Successfully created directory: ', folder.path);
          }, function(err) {
            deferred.reject(err);
            throw new Error(err);
          });
      });
    return deferred.promise;
  },
  mkFile: function(file_path, body) {
    writeFile(file_path, body)
      .then(function() {
        console.log('File written in: ', file_path);
      }, function(err) {
        console.log('Unable to write file to: ', file_path);
        throw new Error(err);
      });
  },
  readDir: function(folder) {
    return readDir(folder);
  },
  delDir: function(folder) {
    return delDir(folder);
  }
};

module.exports = Filesystem;
