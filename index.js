'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var crisper = require('crisper');

function File(file, filename, contents) {
	return new gutil.File({
		cwd: file.cwd,
		base: file.base,
		path: path.join(file.base, filename),
		contents: new Buffer(contents)
	});
}

function getFilename(filepath) {
	var basename = path.basename(filepath, path.extname(filepath));
	return {
		html: basename + '.html',
		js: basename + '.js'
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

		var splitfile = getFilename(file.path)
		var split = crisper.split(file.contents.toString(), splitfile.js);

		if (split.html) {
			this.push(new File(file, splitfile.html, split.html));
		}

		if (split.js) {
			this.push(new File(file, splitfile.js, split.js));
		}

		cb();
	});
};
