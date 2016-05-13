'use strict';
const path = require('path');
const _ = require('lodash');

// some view helpers to DRY up simple string manipulations
module.exports = {
  "pathToId": function(inPath) {
    return inPath.replace(/\//g,'~')
  },
  "idToPath": function(address) {
    return address.replace(/~/g,'/');
  },
  "pathContent": function(inPath) {
    return '^' + inPath.replace(/\//g,'~') + '~[^\~]*$'
  },
  "ancestorName": function(doc,depth) {    
    if (doc) {
      return doc._system.breadcrumbs[depth] ?  doc._system.breadcrumbs[depth] : ''                
    } else {
      return ''
    }
  },
  "isHidden": function(basename) {
    basename ? basename : this.basename;
    return basename.match(/^\_.*?$/) ? 'hidden' : ''
  },
  "activeHash": function(path) {
    path ? path : this.id;
    return document.location.hash.match(path) ? true : undefined
  },
  "humanTitle": function(str) {
    return s(str).humanize().titleize().value()
  },
  "tagListOptions": function(collection) {
    var tagList = _.intersection(_.flatten(_.map(_.mapValues(collection, 'tags'), function(tgs){ if (tgs) return tgs })));
    tagList.push('Archived')
    return tagList;
  },
  "filterLink": function(tagList, tag) {
    var tags = _.clone(tagList);
    if (!tags) tags = [];
    if (!_.includes(tags, tag)) tags.push(tag);
  
    var query = "?";
    if (tags.length) query = query + "tags=" + tags.join(',').replace(/,+$/, "");
    return query;  
  },
  "filterLinkRemove": function(tagList, tag) {
    var query = '';
    var tags = _.clone(tagList);
    if (tags.length) {
      var query = "?";
      query = query + "tags=" + _.remove(tags, function(t) {return t != tag }).join(',').replace(/,+$/, "");    
    }
    return query;  
  },
  "activeTags": function() {
    return (riot.route.query() && riot.route.query()['tags']) ? riot.route.query()['tags'].split(',') : [];
  },
  "filteredByTag": function(collection, criteria) { 
    
    return  _.chain(collection)
      .map(function(item, idx) { 
        if (!_.includes(['config','views','meta'], idx) && (!criteria || _.isMatch(item, criteria))) {          
          var displayArchived = false;
          
          if (criteria && criteria.tags && criteria.tags.length && _.includes(criteria.tags,'Archived')) 
            displayArchived = true;
          
          if ((!item.tags || item.tags && (!_.includes(item.tags,'Archived') || displayArchived)))
            return [idx, item];
          
        }
      })
      .filter(function(item) {if (item) return true } )
      .fromPairs()
      .value()
  },
  "filteredArray": function (collection, criteria) { 
  
    return  collection.filter(function(item) { 
        if (!criteria || _.isMatch(item, criteria)) {          
          var displayArchived = false;
        
          if (criteria && criteria.tags && criteria.tags.length && _.includes(criteria.tags,'Archived')) 
            displayArchived = true;
        
          if ((!item.tags || item.tags && (!_.includes(item.tags,'Archived') || displayArchived)))
            return item
        
        }
      })
  },
  "displayOrdered": function(inCollection) {
    var collection = _.cloneDeep(inCollection)
    return _.chain(collection).map((item, srcIdx) => {item.srcIdx = srcIdx; return item }).sortBy((item) => {return parseInt(item.displayOrder)}).value()
  },  
  "pathToAddress": function(path) {
    return "['" + path.replace(/\//g,"']['") + "']";
  },
  "getProperty": _.get
};