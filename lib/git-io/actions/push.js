'use strict';

const nodegit = require('nodegit');

module.exports = function(options, callback) {
  
    return nodegit.Repository.open(options.repoDir)
    // Add a new remote
    .then(function(repository) {    
    
      return nodegit.Remote.lookup(repository, options.git.remote, function(err, remote) {
        if (err) return nodegit.Remote.create(repository, options.git.remote, options.git.repo)
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
              credentials: function() {
                if (firstPass) {
                  firstPass = false;                
                  var cred = nodegit.Cred.userpassPlaintextNew('x-token-auth', options.user.accessToken);
                  console.log(cred);
                  return cred;
                } else {
                  return nodegit.Cred.defaultNew()
                }
              },
              certificateCheck: function() {
                return 1;
              }
            }
          },
          true
        );
        
      } catch(e) {
        console.log(`Error on push attempt: ${e}`);
        callback({error: e});
      }
      
      
      
    })
    .then(function(res){
      console.log('done')
    })
    .catch(function(err){
      console.log("Error: " + err)
    })
  
}