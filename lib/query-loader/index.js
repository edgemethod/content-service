'use strict';

const async = require('asyncawait/async');
const await = require('asyncawait/await');

module.exports = function(datasets, callback) {
  const app = this;
  let data = {};
  
  async(function() {
    
    Object.keys(datasets).forEach(function (key) {
      data[key] = await(
        app.service('content').find({"query": datasets[key]})
          .catch(function(err) {
            console.log(err);
          })
      )
            
    });
    data['doc'] = (data['docSearch'] && data['docSearch'].data && data['docSearch'].data[0]) ? data['docSearch'].data[0] : undefined;     
    callback(data);
  })();

}