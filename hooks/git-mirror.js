'use strict';
const appRoot = require('app-root-path');
const path = require('path');
const git = require("../lib/git-io");
const helpers = require("../lib/helpers");
const request = require("request");





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
    

    try {
      git.delete(setupOptions(hook));
    }
    catch(e) {
      console.log(`Error: ${e}`)
    }
    
    return hook
    
  };
}

module.exports.pushOnRootUpdate = function() {
  return function(hook) {
    
    var options = setupOptions(hook);
    
    if (hook.method == 'update' && hook.id == null) {
      
      try {
        git.push(setupOptions(hook));
      }
      catch(e) {
        console.log(`Error: ${e}`)
      }
    
    }
    
    return hook
    
  };
}

module.exports.addBitbucketPrimaryEmailToUser = function() {
  return function(hook) {

    if (hook.data && hook.data.bitbucket && hook.data.bitbucket.accessToken && !hook.data.email) {
      return new Promise((resolve, reject) => {
        // do async stuff here, then resolve with the hook object
      request
        .get(`https://api.bitbucket.com/2.0/user/emails?access_token=${hook.data.bitbucket.accessToken}`, 
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log(body) // Show the HTML for the Google homepage.
              var emails = JSON.parse(body);
              emails.values.forEach((email) => {
                if (email.is_primary) {
                  hook.data.email = email.email;
                  hook.data.name = hook.data.bitbucket.display_name;
                  console.log(["Hi There: ", hook.data.email])
                  resolve(hook);
                }
              });
              
            } else {
              console.log([error,response, response.statusCode, response.statusMessage])
              resolve(hook);
            }
          }
        );
        
      });
      
        
      
    } else {
      return hook;
    }
    
    
  };
}


var setupOptions = (hook) => {
    
  var targetId = (hook.id ? hook.id : (hook.data ? hook.data.id : ''));
  var options = {};
  options.git = hook.app.get('git');
  
  
  var gitConfig = hook.app.get('git');  
  options.user = {}

  if (hook.params.user && hook.params.user.email) {

    options.user = {
      name: hook.params.user.name,
      email: hook.params.user.email,
      accessToken: hook.params.user.bitbucket.accessToken
    }
  }
  else if (options.git) {
    options.user = {
      name: options.git.username,
      email: options.git.email
    }
  }  
  else {
    options.user = {
      name: "Local User", 
      email: "do-not-email@edgemethod.com"
    }
  };    
  
  
  //options.user = git.configUser(hook);
  
  options.repoName = hook.app.services.content.options.name;
  options.repoDir = `${appRoot}/${options.repoName}`;
  
  options.pathName = targetId ? helpers.idToPath(targetId) : '';
  options.directoryName = path.dirname(options.pathName);
  options.fileName = options.pathName.replace(`${options.directoryName}/`, '');
  
  options.doc = hook.data;
  options.commitMessage = hook.method;
  
  return options
  
}
