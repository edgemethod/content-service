'use strict';
const appRoot = require('app-root-path');
const path = require('path');
const git = require("../lib/git-io");
const helpers = require("../lib/helpers");


module.exports.write = function() {
  return function(hook) {
    
    if (hook.method == "create" || Object.keys(hook.result).length > 0) {

      try {
        git.write(setupOptions(hook));        
      }        
      catch(e) {
        console.log(`Error: ${e}`)
      }    
      
    } else {
      //console.log("No changes, no commit needed.")
    }
        
    return hook
    
  };
}

module.exports.delete = function() {
  return function(hook) {
    console.log(hook);
    
    git.delete(setupOptions(hook));

    try {
    }
    catch(e) {
      console.log(`Error: ${e}`)
    }
    
    return hook
    
  };
}

var setupOptions = (hook) => {
  
  var options = {};
  
  var targetId = (hook.id ? hook.id : hook.data.id);
  
  options.user = git.configUser(hook.app);
  
  options.repoName = hook.app.services.content.options.name;
  options.repoDir = `${appRoot}/${options.repoName}`;
  
  options.pathName = helpers.idToPath(targetId);
  options.directoryName = path.dirname(options.pathName);
  options.fileName = options.pathName.replace(`${options.directoryName}/`, '');
  
  options.doc = hook.data;
  options.commitMessage = hook.method;
  
  return options
  
}
