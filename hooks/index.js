'use strict';

//const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const filter = require('../lib/feathers-query-filters');

// git stuff
const gitMirror = require('./git-mirror');

// populate _system
const systemContext = require('./system-context');

//    (hook) => { delete(hook.data._system); return hook },    

exports.before = {
  all: [],
  find:[],
  get: [],
  create: [
    gitMirror.write()
  ],
  update: [],
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
    hooks.remove('_system'),
    gitMirror.write()
  ],
  patch: [],
  remove: []
};
