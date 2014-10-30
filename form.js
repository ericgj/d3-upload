'use strict';

var Form  = require('d3-form')
  , Upload = require('./model')
  , dispatch = require('d3-dispatch')
  , rebind = require('d3-rebind')


module.exports = function(){

  var buffer = []
    , upload
    , labelButton
    , dispatcher = dispatch("upload");

  // upload is a factory function returning an "open" xhr (url is set)
  render.using = function(_){
    upload = _; return this;
  }

  render.labelButton = function(_){
    labelButton = _; return this;
  }

  function render(selection){ 
    selection.call(
      Form().classed('upload-form')
            .field( DelegateInput('upload').type('button').delegates('click', 'file') )
            .field( FileInput('file').dispatches('submit') ) 
            .on('input',  push  )
            .on('submit', shift )
            .on('submit.reset', reset )
    );

    if (labelButton){ 
      selection.select('input[name="upload"]').attr('value',labelButton);
    }

    // not ideal, may cause problems in edge case of multiple forms under selection
    function reset(){
      var form = selection.select('form.upload-form').node();
      form.reset();
    }
  }


  function shift(){
    buffer.forEach( send );
    buffer = [];
  }

  function send(file){
    file = Upload(file);
    
    var xhr = upload();

    // uploader events -> set file state
    xhr.onload            = setUploaded(file);
    xhr.onerror           = setError(file);
    xhr.ontimeout         = setError(file, 'Request timed out.');
    onErrorResponse(xhr, setError(file));
    xhr.upload.onprogress = setProgress(file);

    // file abort event -> abort uploader
    file.on('setting.aborted', whenSettingStatus('aborted', abortUpload(xhr)) );

    // emit upload file 
    dispatcher.upload(file);
   
    // before send -> set file status
    file.set('status', 'uploading');

    // start upload
    xhr.send( formdata(file.changedValue()) );
  }

  // note this works only because the form has a single field
  function push(k,v){
    var input = {}; input[k] = v;
    if (input.file) buffer.push(input);
  }

  rebind(render, dispatcher, 'on'); 
  return render;
}
 
function formdata(file){
  var body = new FormData();
  for (var k in file){
    body.append(k, file[k]);
  }
  return body;
}

function setUploading(file){
  return function(){
    file.set('status', 'uploading');
  }
}

function setProgress(file){
  return function(e){
    var percent =  ((e.loaded / e.total) * 100);
    file.set('progress', percent);
    if (percent >= 100){
      file.set('status', 'processing');  // blob is on the server side
    }
  }
}

function setUploaded(file){
  return function(e){
    if (isErrorResponse(e.target)) return;  // note needed because onload fires even when error response
    file.set('status', 'uploaded');
  }
}

function setError(file,msg){
  return function(e){
    file.set('status', 'error');
    var err = e.target.statusText + " (" + e.target.status + ")";
    file.set('error', msg || err);
  }
}

function whenSettingStatus(status,fn){
  return function(k,v){
    if (k == 'status' && v == status) fn();
  }
}
   
function abortUpload(uploader){
  return function(){
    uploader.abort();
  }
}

function onErrorResponse(xhr, fn){
  xhr.onreadystatechange = function(){
    if (isErrorResponse(xhr)){
      fn({ target: xhr });
    }
  }
}

// not sure how robust this is
function isErrorResponse(xhr){
  return (4 == xhr.readyState) &&
         ((xhr.status < 200 || xhr.status >= 300) && status !== 304);
}

// UI

function DelegateInput(name){

  var type = 'text'
    , delegates = {}

  render.type = function(_){
    type = _; return this;
  }

  render.delegates = function(event, other){
    delegates[event] = other; return this;
  }

  render.enter = function(enter){
    enter.append('input')
         .attr('type', type)
         .attr('name', name);

  }

  function render(box){
    var field = box.select('[name='+name+']');

    for (var k in delegates){
      var parent = d3.select(box.node().parentNode)
        , target = parent.select('[name='+delegates[k]+']')
      if (!target || target.empty()) {
        throw new Error('No such delegate field: ' + delegates[k]);
      }
      var el = target.node();
      if (!el[k]) {
        throw new Error('No such delegate event: ' + k);
      }
      field.on(k, el[k].bind(el));  
    }
  }

  return render;
}

function FileInput(name){
  
  var dispatcher
    , dispatches

  render.dispatch = function(_){
    dispatcher = _; return this;
  }
  
  render.dispatches = function(_){
    dispatches = _; return this;
  }

  render.enter = function(enter){
    enter.append('input')
         .attr('type','file')
         .attr('name',name)
         .style('display','none');
  }

  function render(box){
    var input = box.select('input[name='+name+']');
    
    if (dispatcher){
      input.on('change', dispatchInput );
    }
  }

  function dispatchInput(){
    for (var i=0;i<this.files.length;++i){
      var file = this.files.item(i)
      if (!file) continue;
      dispatcher.input('file', file);
    }
    if (dispatches) dispatcher[dispatches]();
  }

  return render;
}
