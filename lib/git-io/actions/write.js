'use strict';

const appRoot = require('app-root-path');
const path = require('path');
const nodegit = require('nodegit');
const promisify = require("promisify-node");
const fse = promisify(require("fs-extra"));

module.exports = function(options, callback) {
  
  var repo;
  var index;
  var oid;
  var targetDirectory;
  
  nodegit.Repository.open(options.repoDir)
  .then(function(repoResult) {
    repo = repoResult;
    targetDirectory = path.join(repo.workdir(), options.directoryName);
    console.log(targetDirectory);
    return fse.ensureDirSync(targetDirectory);
  })
  .then(function(){
      var out = options.doc
    
      // special treatment for objects -- clean out some feathers stuff, then serialize
      if (options.fileName.match(/\.json$/)) {
        out = {};
        Object.assign(out, options.doc);
        delete(out._system);
        delete(out.id);
        out = JSON.stringify(options.doc, null, '\t');    
      }
      
      return fse.writeFile(
        path.join(targetDirectory, options.fileName),
        out
      );    
  })
  .then(function() {
    var filesToAdd = [`${options.directoryName}/${options.fileName}`];
  
    console.log(filesToAdd);

    var timeNow = Math.floor(Date.now() / 1000);
    var author = nodegit.Signature.create(options.user.name,
      options.user.email, timeNow, 0);
    var committer = nodegit.Signature.create(options.user.name,
      options.user.email, timeNow, 0);
    var message = `${options.commitMessage} ${options.directoryName}/${options.fileName}`;
    return repo.createCommitOnHead(filesToAdd, author, committer, message);    
  
  })
  .done(function(commitId) {
    if (commitId) console.log(`New Commit: ${commitId}`);    
    if (callback) callback(undefined, {success: `New Commit: ${commitId}`});
  });
}