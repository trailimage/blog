'use strict';

// many times faster than the node module cache
// (probably because it doesn't have to probe the file system for possibilities)
module.exports = function(pattern = './*.js') {
   const modules = {};

   return name => {
      if (modules[name] === undefined) { modules[name] = require(pattern.replace('*', name)); }
      return modules[name];
   }
};