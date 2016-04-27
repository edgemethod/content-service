'use strict';

const AppRoot = require('app-root-path');
const rethink = require('rethinkdbdash');
const service = require( '../../node_modules/feathers-rethinkdb');

const hooks = require('./hooks');
const Proto = require('uberproto');
const filter = require('../../node_modules/feathers-query-filters');


// file uploads
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const git = require('./lib/git-io');
const path = require('path');


module.exports = function(repoName){
  const app = this;
  repoName = repoName || 'content';

  // setup

  const r = rethink({
    db: process.env.CACHE_DB_NAME
  });
    
  git.import(repoName, r);
   
  const options = {
    Model: r,
    name: repoName,
    paginate: {
      default: 100,
      max: 1000
    }
  };

  // push to upstream/remote via bitbucket auth,
  // put this here so hopefully it pre-empts the core service PUT handler
  app.put([`/${repoName}`], function(req, res, next) {
    if (req.user && req.user.token) {
      
      var gitOptions = {
        repoDir: `${AppRoot}/${options.name}`,
        userToken: req.user.token
      };
      try {
        
        git.push(gitOptions, function(err, result) {
          console.log(["push report", err, result]);
          if (err) res.send({error: err})
          else res.send(result);
        });        
        
      
      } catch(e) {
        res.send({error: `there was a problem with your push request ${e}`})      
      }
    } else {
      res.send({error: "no auth token"})
    }
  });
  
  // Initialize our service with any options it requires
  app.use(`/${repoName}`, service(options));
  
  
  
  
  // custom namespace/methods for asset upload handler.  
  // could port this over to the generic create handler, but leaving it here for now
  
  app.post([`/${repoName}/assets/*`], upload.any('asset'), function(req, res, next) {
    console.log(req.params, req.files)
    
    const pathName = `_assets/${req.params[0]}`;
    
    // pre-set shared options
    var gitOptions = {
      user: git.configUser(app),
      repoName: options.name,
      repoDir: `${AppRoot}/${options.name}`,
      pathName: pathName,
      directoryName: pathName,
      commitMessage: "asset uploaded",      
      // .doc and .fileName get populated below, per-file
    };
        
    
    if (req.files) {
      req.files.forEach((file) => {
        gitOptions.doc = file.buffer;
        gitOptions.fileName = file.originalname;
        console.log(gitOptions);
        git.write(gitOptions, function(err, result) {
          if (err) res.send({error: `Could not upload ${gitOptions.fileName}`});  
          else res.send({ success: true, filename: file.originalname });        
        });
              
      });
    }

  });


  // Get our initialize service to that we can bind hooks
  const contentService = app.service(`/${repoName}`);

  // Set up our before hooks
  contentService.before(hooks.before);

  // Set up our after hooks
  contentService.after(hooks.after);
};