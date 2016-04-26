'use strict';

const nodegit = require('nodegit');

module.exports = function(options, callback) {
  
  try {
  
    nodegit.Repository.open(options.repoDir)
    // Add a new remote
    .then(function(repository) {    
    
      // load the remote from .env config file with fallback to create a new one if not found
      return nodegit.Remote.lookup(repository, process.env.BITBUCKET_REMOTENAME, function(err, remote) {
        if (err) return nodegit.Remote.create(repository, process.env.BITBUCKET_REMOTENAME, process.env.BITBUCKET_REPO)
        else return remote
      })
    })
    .then(function(remote) {
      var firstPass = true;
      try {
        // Create the push object for this remote
        return remote.push(
          ["refs/heads/master:refs/heads/master"],
          {
            callbacks: {
              credentials: function(userName) {
                if (firstPass) {
                  firstPass = false;
                  var userCred = nodegit.Cred.userpassPlaintextNew('x-token-auth', options.userToken);
              
                  return userCred;
                } else {
                  return nodegit.Cred.defaultNew();
                }
              }
            }
          }
        );
        
      } catch(e) {
        console.log(`Error on push attempt: ${e}`);
        callback({error: e});
      }
      
      
      
    })
  
    .done(function() {
      console.log("Done!");
      callback(undefined,{success: true});    
    
    });
    
  } catch(e) {
    callback({error: `push error: ${e}`});    
  }
  
}