'use strict';

//const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const filter = require('feathers-query-filters');

// git stuff
const gitMirror = require('./git-mirror');

// populate _system
const systemContext = require('./system-context');

//    (hook) => { delete(hook.data._system); return hook },    

exports.before = {
  all: [
      auth.verifyToken(),
      auth.populateUser(),
      auth.restrictToAuthenticated()
  ],
  find:[],
  get: [],
  create: [
    (hook) => { delete(hook.data._system); return hook },
    gitMirror.write()
  ],
  update: [gitMirror.pushOnRootUpdate()],
  patch: [],
  remove: [gitMirror.delete()]
//  remove: []
};

exports.after = {
  all: [],
  find: [systemContext()],
  get: [],
  create: [],
  update: [
    (hook) => { delete(hook.data._system); return hook },
    gitMirror.write()
  ],
  patch: [],
  remove: []
};
