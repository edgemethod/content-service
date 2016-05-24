'use strict';
const path = require('path');
const _ = require('lodash');

// some view helpers to DRY up simple string manipulations
module.exports = {
  "pathToId": function(inPath) {
    //return inPath.replace(/\//g,'~')
      return inPath
  },
  "idToPath": function(address) {
    //return address.replace(/~/g,'/');
    return address
  },
  "pathToAddress": function(path) {
    return "['" + path.replace(/\//g,"']['") + "']";
  },
  "parentForPath": function(path) {
    var parts = path.split('/');
    return path.replace('/' + parts[parts.length - 1], '');
  },
  "pathContent": function(inPath) {
    //return '^' + inPath.replace(/\//g,'~') + '~[^\~]*$'
    return '^' + inPath + '\/[^\/]*$'
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
  "getProperty": _.get,
  "deleteWithAssets": function(deleteId, successCallback) {    
    app.service('content').remove(deleteId)
      .then(function(result) {
        return app.service('content').remove('_assets%2F' + deleteId.replace(".json",""))
          .then(function(result) {
            if (successCallback) successCallback();        
          });            
      })
      .catch(function(err) {
        console.error(err);
      })    
  },
  "initJsonEditor" : function(editorDomId, doc, schemaPath, updateFn) {
    var dirty = false;
    var editor;
    
    JSONEditor.plugins.selectize.enable = true;
    JSONEditor.defaults.options.theme = 'bootstrap3';
    JSONEditor.defaults.options.iconlib = 'fontawesome4';
    JSONEditor.defaults.options.disable_edit_json = true;
    //JSONEditor.defaults.options.disable_properties = true;
    if (doc && Object.keys(doc).length > 0) JSONEditor.defaults.options.no_additional_properties = true;
    // Specify upload handler
    JSONEditor.defaults.options.upload = function(type, file, cbs) {
      if (type === 'root.upload_fail') cbs.failure('Upload failed');
      else {
      var data = new FormData();
      data.append('file-0', file);

        $.ajax({
            url: '/content/assets/' + doc._system.url,
            type: 'POST',
            data: data,
            cache: false,
            contentType: false,
            processData: false,        
            success: function(result,textStatus) {
              if (textStatus == 'success') {
                toastr.success( file.name + " was successfully uploaded!");
                cbs.success('/assets/' + doc._system.url + '/' + file.name)

              } else {
                alert("Didn't work" + result + other);
              }
            }
        });

      }
    };
    
    
    app.service('content').get(encodeURIComponent(schemaPath)).then(function(schema) {
      
      
        editor = new JSONEditor(document.getElementById(editorDomId), {
          schema: schema,
          startval: doc
        });

        editor.on('ready',function() {
          // Now the api methods will be available
          $('.property-selector input:checkbox').click();
          $('.property-selector input:checkbox').click();
        });
      
      
        editor.on('change',function() {

          _.forEach(editor.getValue(), function(value, key) {
            if (doc) {
              if (doc[key] !== value) {
                doc[key] = value;
                dirty = true;
              }
            }
          });
          
          //tag.update();
          if (dirty) updateFn();
        });
    
        return editor;
    
    })
    
  
  }
};