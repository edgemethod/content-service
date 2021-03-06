'use strict';

const AppRoot = require('app-root-path');
const rethink = require('rethinkdbdash');
const service = require( 'feathers-rethinkdb');

const hooks = require('./hooks');
const Proto = require('uberproto');
const filter = require('feathers-query-filters');


// file uploads
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const git = require('./lib/git-io');
const path = require('path');

// setup



module.exports = function(repoName){
  const app = this;

  repoName = repoName || 'content';

  const r = rethink({
    db: `${app.dbName}`
  });

  

  console.log(["Content Service: ",repoName]);
  
  r.tableList().contains(repoName)
    .do(tableExists => r.branch( tableExists, {created: 0}, r.tableCreate(repoName))).run()
    .then((results) => {
      if (results['tables_created'] && results['tables_created'] > 0) git.import(repoName, r);  
    })
    .then(() => {
      if (process.env.NODE_ENV != "production") {
        console.log(["Dev mode - reloading from filesystem: ",repoName]);
        r.table(repoName).delete({})
          .then((result) => {
            git.import(repoName, r);        
          });
      }      
    })
    .catch(err => console.log(err));

    const options = {
      Model: r,
      name: repoName,
      paginate: {
        default: 100,
        max: 1000
      }
    };
    
    
    // Initialize our service with any options it requires
    app.use(`/${repoName}`,service(options));
    
  
  
  // Get our initialize service to that we can bind hooks

  const contentService = app.service(`/${repoName}`);
  
  // Set up our before hooks
  
  contentService.before(hooks.before);

  // Set up our after hooks
  contentService.after(hooks.after);
  



  // custom namespace/methods for asset upload handler.  
  // could port this over to the generic create handler, but leaving it here for now
  app.post([`/${repoName}/assets/*`], upload.any('asset'), function(req, res, next) {
    //console.log(req.params, req.files)
  
    const pathName = `_assets/${req.params[0]}`;

    // pre-set shared options
    var gitOptions = {
      user: {
        name: "Local User", 
        email: "do-not-email@edgemethod.com"
      },
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
  
  
  
  
};
