'use strict';

var Q       = require('q'),
    fs      = require('fs'),
    mkdir   = Q.denodeify(fs.mkdir);

var Filesystem = {
    mkDir: function(folder, dir_perm) {
        mkdir(folder, dir_perm)
          .then(null, function(err) {
            if(err.errno !== 47) {
              throw new Error(err);
            }
          });
    }
};

module.exports = Filesystem;