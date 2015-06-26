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
    return { html: htmlPath, js: jsPath };
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
        var split = crisper.split(file.contents.toString(), splitfile.js);
        var stream = this;

        Object.keys(split).forEach(function(type) {
          if (split[type]) {
            stream.push(splitFile(file, splitfile[type], split[type]));
          }
        });

        cb();
    });
};