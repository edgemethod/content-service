"use strict";

const AppRoot = require('app-root-path');
const walk = require('walk');
const fs = require('fs');
const path = require('path');
const helpers = require('../../helpers');

var walker;

const options = {
    //followLinks: false,
    // directories with these keys will be skipped 
  filters: [/\.DS_Store/,/\.git/,/^tmp/]
  };

const extensions = [
  '.json',
  '.jade',
  '.pug',
  '.jpg',
  '.png',
  '.gif'
];

module.exports = function (repoName, r) {
  
  const dbName = path.basename(`${AppRoot}`).replace(/[\. -]/g,'_');
  
 
  const db = r.db(dbName).table(repoName);


  
  walker = walk.walk(`${AppRoot}/${repoName}`, options);
 
  walker.on("file", function (root, fileStats, next) {
    var absolutePath = path.join(root, fileStats.name);
    var itemPath = absolutePath.replace(`${AppRoot}/${repoName}/`,'');
    var ext = path.extname(itemPath);
    var node = {};
    node.id = helpers.pathToId(itemPath);
    
    console.log(`File: ${itemPath}`);
    
    if (extensions.includes(ext)) {
      if (ext == '.jade' || ext == '.pug') {
        node.type = "template";
        node.format = "pug";
        db.insert(node).run()
        
      }
      else if (ext == '.jpg' || ext == '.png' || ext == '.gif') {
        node.type = "image";
        node.format = ext;
        db.insert(node).run();
      }
      else if (ext == '.json'){
        node=require(absolutePath);
        node.id = helpers.pathToId(itemPath);
        db.insert(node).run();
      }
      
    }
    next();
  });
 
 
  walker.on("directory", function (root, dirStats, next) {
    var itemPath = path.join(root, dirStats.name).replace(`${AppRoot}\/${repoName}\/`,'');
    console.log(`Dir: ${itemPath}`);    
    
   if (itemPath != '.git') { // skip .git base entry
      
      var dirRef = {};
      dirRef.id = helpers.pathToId(itemPath);
      dirRef.type = 'directory';      
      db.insert(dirRef).run()      
    }
    
    next();
    
  });
  
  
  walker.on("errors", function (root, nodeStatsArray, next) {
    next();
  });
 
  walker.on("end", function () {
    console.log(`${repoName}: Import Completed`);
  });

};

