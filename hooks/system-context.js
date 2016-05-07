'use strict';

const path = require('path');
const helpers = require('../lib/helpers');

module.exports = function() {
  return function(hook) {

    // loop add meta-context info for easier work in templates
    hook.result.data.forEach((item,idx) => {
      
      var itemPath = helpers.idToPath(item.id);
      var breadcrumbs = itemPath.split('/');
      var itemParent = (breadcrumbs && breadcrumbs.length >= 1) ? breadcrumbs[breadcrumbs.length - 2] : undefined;
      var basename = path.basename(itemPath);
      hook.result.data[idx]._system = {
        "url" : itemPath.replace(/\.json$/,''),
        "action" : (item.type == 'directory' ? 'browser' : 'open'),
        "path" : itemPath,
        "breadcrumbs" : breadcrumbs,
        "parent" : itemParent,
        "basename" : basename,
        "hidden" : (basename.match(/^_.*$/) ? true : false)
      };
      
    })

    return hook;
  };
};
