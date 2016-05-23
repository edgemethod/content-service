'use strict';

//const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const filter = require('feathers-query-filters');

// git stuff
const gitMirror = require('./git-mirror');

const helpers = require('../lib/helpers');

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
  get: [
  ],
  create: [
    (hook) => {hook.data.createdAt = new Date(); return hook },
    auth.associateCurrentUser({ idField: 'id', as: 'createdByUserId' }),
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
  find: [
    systemContext(),
    hooks.populate('user', {
      service: 'users',
      field: 'createdByUserId'  
    }),
    hooks.populate('source', {
      service: 'content',
      field: 'sourcePath'  
    })
  ],
  get: [],
  create: [],
  update: [
    (hook) => { delete(hook.data._system); return hook },
    (hook) => { delete(hook.data.id); return hook },
    (hook) => { delete(hook.data.user); return hook },
    (hook) => { delete(hook.data.source); return hook },
    gitMirror.write()
  ],
  patch: [],
  remove: []
};
