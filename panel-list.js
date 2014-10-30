'use strict';

var View = require('./view')
var Upload = require('./model')

module.exports = function(){

  var fetch 
    , view = View()

  render.view = view;

  render.using = function(_){
    fetch = _; return this;
  }

  function render(selection){
    _render();

    function _render(){
      load( renderList(selection) );
    }
  }

  function renderList(selection){
    return function(models){

      selection.classed('d3-upload',true);
      
      var files = valuesFor(models)
      
      var box = selection.selectAll('.upload-list').data([0]);
          box.enter().append('div').classed('upload-list',true);

      box.call( view, files );

      box.exit().remove();
    }
  }

  function load( cb, eb ){
    fetch( function(err,data){
      if (err){ eb && eb(err); return; }
      cb( data.map(mapUpload) )
    })
  }

  return render;
}


function mapUpload(d){
  return Upload({ 
    file: { 
      name: d.name,
      size: d.size,
      type: d.type
    },
    uploadedTime: d.uploadedTime,
    url: d.url,
    status: 'uploaded'
  })
}

function valuesFor(models){
  return models.map( function(m){
    return m.value();
  })
}
