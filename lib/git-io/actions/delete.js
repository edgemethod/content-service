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

  nodegit.Repository.open(options.repoDir)
  .then(function(repoResult) {
    repo = repoResult;
    return repo.refreshIndex();
  })
  .then(function(idxResult){
    index = idxResult;
  })
  .then(function() {
    return fse.remove(
      path.join(repo.workdir(), options.directoryName, options.fileName)    
    );    
  })
  .then(function() {
      return index.removeAll([path.join(options.directoryName, options.fileName)]);
  })    
  .then(function() {
    return index.write();
  })
  .then(function() {
    return index.writeTree();
  })
  .then(function(oidResult) {
    oid = oidResult;
    return nodegit.Reference.nameToId(repo, "HEAD");
  })
  .then(function(head) {
    return repo.getCommit(head);
  })
  .then(function(parent) {
    var timeNow = Math.floor(Date.now() / 1000);

    var author = nodegit.Signature.create(options.user.name,
      options.user.email, timeNow, 0);
    var committer = nodegit.Signature.create(options.user.name,
      options.user.email, timeNow, 0);

    return repo.createCommit("HEAD", author, committer, `${options.commitMessage} ${options.directoryName}/${options.fileName} `, oid, [parent]);
  })
  .done(function(commitId) {
    console.log("New Commit: ", commitId);
  })

};