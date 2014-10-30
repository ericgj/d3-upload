
# d3-upload

  Async file upload UI

## Features

  - Immediate (not batched) XHR uploads
  - Multiple simultaneous uploads 
  - Per-upload 'abort' link
  - Delete link
  - Integrated UI for listing uploaded/uploading files
  - You provide (stateful) POST and (stateless) GET XHR functions
  - Detailed event-state model
  - Server 'processing' state (after upload finished but before server response)
  - Structural styling only
  - SVG progress bars

## Installation

  Install with [component(1)](http://component.io):

    $ component install ericgj/d3-upload

  Note this libary has an implicit dependency on d3.js. `d3` is assumed to be
  available as a global.

## Example

  ```js
  var Upload = require('d3-upload')
    , uploadingContainer = d3.select('.uploading')
    , uploadedContainer = d3.select('.uploaded')

  // configure upload-ing panel
  var uploadingPanel = Upload.create().using( postFactory );

  // add label to upload button (optional; you could also use CSS)
  uploadingPanel.form.labelButton('Attach');

  // configure upload-ed panel
  var uploadedPanel = Upload.list().using( fetch );
  
  // rerender uploaded panel on newly uploaded file
  uploadingPanel.on('uploaded', renderUploadedPanel); 
  
  // delete on user clicked delete box
  uploadedPanel.view.on('del', delUpload);  

  // initial render
  renderUploadingPanel();
  renderUploadedPanel();

  function renderUploadingPanel(){
    uploadingContainer.call( uploadingPanel );
  }

  function renderUploadedPanel(){
    uploadedContainer.call( uploadedPanel );
  }

  function delUpload(filedata,i){
    // file data includes file name and url (set by server)
    // typically you would use this to build a DELETE request
  }

  ```


## API

TODO


## Backend considerations

TODO


## License

  The MIT License (MIT)

  Copyright (c) 2014 Eric Gjertsen <ericgj72@gmail.com>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
