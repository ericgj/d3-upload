'use strict';

var View        = require('./view')
  , Form        = require('./form')
  , dispatch    = require('d3-dispatch')
  , rebind      = require('d3-rebind')

module.exports = function(){

  var uploads = []
    , form = Form()
    , view = View()
    , dispatcher = dispatch('uploading','processing','uploaded','error','abort','aborted');

  // external access to view and form, in order to configure them
  render.view = view;
  render.form = form;

  render.using = function(_){
    form.using(_); return this;
  }

  // render the upload form, and list
  function render(selection){
    
    selection.classed('d3-upload',true);
    selection.call( form );

    uploads.forEach( onChange( rerender(selection) )      );

    // note the rerender is a bit of a kludge to get around
    // lack of observable collection
    form.on('upload',        pushUpload);
    form.on('upload.render', rerender(selection));

    var current = uploads.map(valueOf);

    var uploadlist = selection.selectAll('.upload-list').data([0]);
        uploadlist.enter().append('div').classed('upload-list',true);
        uploadlist.call(view, current) 

    uploadlist.exit().remove();  
  }

  function rerender(selection){
    return function(){
      render(selection);
    }
  }

  function pushUpload(file){
    onChange( dispatchStatus, 'status' )(file);
    uploads.push(file);
  }

  function dispatchStatus(status,model){
    if (dispatcher[status]) dispatcher[status](model.value());
  }

  // not sure i is reliable here... may need to bind file to 'del' input element
  function abortUpload(d,i){
    var upload = uploads[i];
    upload.set('status', 'aborted');
  }

  view.on('abort',  abortUpload);
  // ignore view.on('del') events here, you can only delete uploaded

  rebind(render, dispatcher, 'on');
  return render;
}


// really better to do this event filtering etc. within model

function onChange(fn,key){
  
  function _guard(model){
    return function(k,v){
      if (key === undefined) return fn(k,v,model);
      if (key == k) return fn(v,model);
    }
  }
  
  return function(model){
    var ns = ( key === undefined ? '' : '.' + key );
    model.on('set' + ns, _guard(model));
  }
}


function valueOf(model){
  return model.value();
}
  
