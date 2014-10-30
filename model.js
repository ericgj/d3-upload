'use strict';

var Model = require('model');

module.exports = Model().attr('file')
                        .attr('url')
                        .attr('status', {default: 'new'})
                        .attr('error')
                        .attr('progress')
                        .attr('uploadedTime')
                   .calc('name', getFrom('file', 'name') )
                   .calc('size', getFrom('file', 'size') )
                   .calc('type', getFrom('file', 'type') )
                   .calc('lastModifiedDate', getFrom('file', 'lastModifiedDate') )
                   .calc('baseName', function(d){
                     var name = d.file && d.file.name;
                     return name && name.split(/[\\/]/).pop();
                   })
                 ;

function getFrom(from, prop){
  return function(d){ 
    return d[from] && d[from][prop]; 
  }
}