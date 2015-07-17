'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var crisper = require('crisper');

function splitFile(file, filename, contents) {
  return new gutil.File({
    cwd: file.cwd,
    base: file.base,
    path: path.join(file.base, filename),
    contents: new Buffer(contents)
  });
}

function getFilename(file) {
  var htmlPath = path.relative(file.base, file.path);
  var jsPath = gutil.replaceExtension(htmlPath, '.js');
  var jsFilename = path.basename(jsPath);
  return { 
    html: htmlPath, 
    js: { 
      path: jsPath, 
      filename: jsFilename
    }
  };
}

module.exports = function () {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
    	cb(null, file);
    	return;
    }

    if (file.isStream()) {
    	cb(new gutil.PluginError('gulp-crisper', 'Streaming not supported'));
    	return;
    }

    var splitfile = getFilename(file);
    var htmlContent = file.contents.toString();
    var split = crisper.split(htmlContent, splitfile.js.filename);
    var stream = this;

    if (split.js.length < 1) {
        stream.push(splitFile(file, splitfile.html, htmlContent));
    } else {
        stream.push(splitFile(file, splitfile.html, split.html));
        stream.push(splitFile(file, splitfile.js.path, split.js));
    }

    cb();
  });
};
