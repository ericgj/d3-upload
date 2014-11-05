# v0.1.1 :: 5 Nov 2014

- Add "queued" mode. This provides a UI similar to the basic (non-ajax) file
  upload UI, with separate steps for choosing files and triggering the upload.
  However, it still uses ajax and not form submit, and allows you complete 
  control over the display of files while they are "queued". See 
  `examples/queued.html` for example usage.

- Immediate (non-queued) mode is still the default, and the interface has not
  changed for this from v0.0.x.

- Allow multiple file uploads (for both immediate and queued mode).


# v0.0.x :: 30 Oct 2014

- Initial versions
