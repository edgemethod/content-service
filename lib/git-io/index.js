'use strict';

const appRoot = require('app-root-path');
const path = require('path');
const nodegit = require('nodegit');
const promisify = require("promisify-node");
const fse = promisify(require("fs-extra"));

module.exports.configUser = function(app) {
  var user = {}
  //if (req.user) return {name: req.user.display_name, email: req.user.username};
  if (process.env.LOCAL_USER_NAME && process.env.LOCAL_USER_EMAIL) user = {name: process.env.LOCAL_USER_NAME, email: process.env.LOCAL_USER_EMAIL};
  else user = {name: "Local User", email: "do-not-email@flowpitch.com"};    
  return user;
}

module.exports.import = require("./actions/import");

module.exports.write = require("./actions/write");

module.exports.delete = require("./actions/delete");

module.exports.push = require("./actions/push");

