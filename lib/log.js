'use strict';
var debug = false;
module.exports = {
  init: function(dbg){
    debug = !!dbg;
    return this;
  },
  log: function() {
    if (!debug) return this;
    console.log.apply(null, arguments);
    return this;
  }
};
