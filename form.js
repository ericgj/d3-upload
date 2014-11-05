'use strict';

var Upload = require('./model')
  , dispatch = require('d3-dispatch')
  , rebind = require('d3-rebind')


module.exports = function(){

  var buffer = []
    , upload
    , labelButton = null
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
      UploadForm().classed('upload-form')
            .labelButton(labelButton)
            .onInput( push  )
            .onSubmit( shift )
    );

  }

  function shift(){
    buffer.forEach( send );
    buffer = [];
  }

  // note this works only because the form has a single field
  function push(k,v){
    var input = {}; input[k] = v;
    if (input.file) buffer.push(input);
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

function UploadForm(){

  var onSubmit, onInput
    , formclass = ''
    , labelButton = null

  render.classed = function(_){
    formclass = _; return this;
  }

  render.labelButton = function(_){
    labelButton = _; return this;
  }

  render.onSubmit = function(_){
    onSubmit = _; return this;
  }

  render.onInput = function(_){
    onInput = _; return this;
  }

  function render(selection){
    var selector = 'form' + (!!formclass ? '.' + formclass : '');
    var form = selection.selectAll(selector).data([0]);
    var enter = form.enter().append('form').classed(formclass, !!formclass);
        enter.append('input')
               .attr('type','file')
               .attr('name','file')
               .style('display','none');
        enter.append('button')
               .attr('type','button')
               .attr('name','upload');
        enter.append('button')
               .attr('type','submit')
               .style('display','none');
    var input = form.select('[name="file"]');
    var choose = form.select('[name="upload"]');
    var submit = form.select('[type="submit"]');

    choose.text(labelButton);

    choose.on('click', trigger(input, 'click') );
    input.on('change', handleInput);
    input.on('change.submit', trigger(submit, 'click') );
    form.on('submit', preventDefault( handleSubmit ) );
    form.on('submit.reset', trigger(form, 'reset') );
  }

  function trigger(selection, evt){
    var el = selection.node();
    return el[evt].bind(el);
  }

  function preventDefault(fn){
    return function(){
      var args = [].slice.call(arguments,0);
      fn.apply(this,args);
      d3.event.preventDefault();
    }
  }

  function handleInput(){
    if (!onInput) return;
    for (var i=0;i<this.files.length;++i){
      var file = this.files.item(i)
      if (!file) continue;
      onInput('file', file);
    }
  }
  
  function handleSubmit(){
    if (!onSubmit) return;
    onSubmit();
  }

  return render;
}


