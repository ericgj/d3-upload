'use strict';

var dispatch = require('d3-dispatch')
  , rebind   = require('d3-rebind')
  
module.exports = function(){

  var progressWidth  = 50
    , progressHeight = 10
    , actionLabels = { abort: 'cancel' }
    , stateLabels  = { aborted: 'cancelled', error: 'error' }
 
  var dispatcher = dispatch('abort', 'del');

  render.progressWidth = function(_){
    progressWidth = _; return this;
  }

  render.progressHeight = function(_){
    progressHeight = _; return this;
  }

  render.labelAction = function(key,val){
    actionLabels[key] = val; return this;
  }

  render.labelState = function(key,val){
    stateLabels[key] = val; return this;
  }

  
  function render(selection, filestats){
     var list = selection.selectAll('ul').data([0])
         list.enter().append('ul')

     var box = list.selectAll('.upload').data(filestats);

     // enter
     var boxentry   = box.enter().append('li').classed('upload',true);
     var viewentry  = boxentry.append('div').classed('view',true);
     var titleentry = viewentry.append('div').classed('title',true);
     var linkentry  = titleentry.append('a');
         linkentry.append('span').classed('file',true);
     var progressentry = viewentry.append('div').classed('progress',true);
         progressentry.append('svg').append('g');
     var statusentry = viewentry.append('div').classed('status',true);
         statusentry.append('span');
     var abortentry = viewentry.append('div').classed('abort',true);
         abortentry.append('a');
     var delentry = viewentry.append('div').classed('del',true);
         delentry.append('a');
     
     // update: set class per status
     box.classed('uploading', uploading);
     box.classed('uploaded',  uploaded);
     box.classed('error',     errored);
     box.classed('aborted',   aborted);

     // update: render sections
     var title = box.select('.view > .title > a');
         title.call( renderTitle );
         title.call( renderLink );
     
     var progress = box.select('.view > .progress');
         progress.call( displayWhen(any(uploading,processing)) );
         progress.call( renderProgress );

     var status = box.select('.view > .status > span');
         status.call( renderStatus );

     var abort = box.select('.view > .abort > a');
         abort.call( displayWhen(uploading) );
         abort.call( renderAbort );

     var del = box.select('.view > .del > a');
         del.call( displayWhen(uploaded) );
         del.call( renderDel );

     // exit
     box.exit().remove();
     list.exit().remove();

  }

  function renderTitle(selection){
    selection.select('.file').text( getAccessor('baseName') );
    // selection.select('.status').text( currentLabelState );
  }

  function renderLink(selection){
    selection.attr('href', getAccessor('url'))
  }

  // TODO find a responsive way to deal with width & height ?
  function renderProgress(box){
    var w = progressWidth, h = progressHeight

    var xscale = d3.scale.linear().range([0,w]).domain([0,100]);
    var svg  = box.select('svg')
        svg.attr('width',w).attr('height',h);

    var rect = svg.select('g').selectAll('rect').data( itselfWhen(hasProgress) )
        rect.enter().append('rect').classed('bar', true)
                      .attr('height', h)
    rect.attr('width', function(d){ return xscale(d.progress); } );

    var line = svg.select('g').selectAll('line').data( itselfWhen(hasProgress) )
        line.enter().append('line').classed('end', true)
                      .attr('x1', xscale(100)).attr('x2', xscale(100))
                      .attr('y1', 0).attr('y2', h)
                      
    line.exit().remove();
    rect.exit().remove();
  }

  function renderStatus(selection){
    selection.text( currentLabelState );
  }

  function renderAbort(selection){
    selection.text( labelAction('abort') );
    selection.on('click', dispatcher.abort);
  }

  function renderDel(selection){
    selection.text( labelAction('del') );
    selection.on('click', dispatcher.del);
  }

  function currentLabelState(d){
    return labelState(d.status);
  }

  function labelAction(name){
    return actionLabels[name] || null;
  }

  function labelState(name){
    return stateLabels[name] || null;
  }

  rebind(render, dispatcher, 'on');
  return render;
} 


// upload status predicates

function hasProgress(d){
  return (+d.progress) > 0;
}

function hasUrl(d){
  return !!d.url;
}

function initial(d){
  return (d.status == 'new');
}

function uploading(d){
  return (d.status == 'uploading');
}

function processing(d){
  return (d.status == 'processing');
}

function uploaded(d){
  return (d.status == 'uploaded');
}

function errored(d){
  return (d.status == 'error');
}

function aborted(d){
  return (d.status == 'aborted');
}

function getAccessor(name){
  return (typeof name == 'function' ? 
            name : 
            function(d){ return d[name]; } 
         );
}
  

// utils

function itself(d){
  return [d];
}

function itselfWhen(pred){
  return function(d,i){
    return !!pred(d,i) ? itself(d) : [];
  }
}

function isNot(fn){ 
  return function(d,i){
    return !fn(d,i);
  }
}

function all(){
  var fns = [].slice.call(arguments,0);
  return function(d,i){
    return fns.reduce( function(memo,fn){
      return memo && fn(d,i);
    }, true);
  }
}

function any(){
  var fns = [].slice.call(arguments,0);
  return function(d,i){
    return fns.reduce( function(memo,fn){
      return memo || fn(d,i);
    }, false);
  }
}

function displayWhen(pred){
  function _display(d,i){
    return !!pred(d,i) ? null : 'none';
  }

  return function(selection){
    selection.style('display', _display);
  }
}
