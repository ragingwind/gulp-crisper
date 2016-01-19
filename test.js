'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var vulcanize = require('gulp-vulcanize');
var crisper = require('./');

function copyTestFile(src, dest) {
	fs.writeFileSync(dest, fs.readFileSync(src, 'utf8'));
}

describe('should do for csp', function () {
	beforeEach(function (cb) {
		rimraf.sync('tmp');
		mkdirp.sync('tmp/dist');

		copyTestFile('fixture/index.html', path.join('tmp', 'index.html'));
		copyTestFile('fixture/import.html', path.join('tmp', 'import.html'));

		var stream = vulcanize();

		stream.on('data', function (file) {
			fs.writeFileSync(path.join('tmp', 'vulcanize.html'), file.contents);
		});

		stream.on('end', cb);

		stream.write(new gutil.File({
			cwd: __dirname,
			base: path.join(__dirname, 'tmp'),
			path: path.join('tmp', 'index.html'),
			contents: fs.readFileSync(path.join('tmp', 'index.html'))
		}));

		stream.end();
	});

	it('simple-usage', function (cb) {
		var stream = crisper();

		stream.on('data', function (file) {
			var contents = file.contents.toString();
			var rex = {
				js: /Polymer\({/,
				html: /<script src=\"vulcanize.js\".*><\/script>/
			};

			if (/\.html$/.test(file.path)) {
				assert(rex.html.test(contents));
			} else if (/\.js$/.test(file.path)) {
				assert(rex.js.test(contents));
			} else {
				assert(null);
			}

			if (/\.js$/.test(file.path)) {
				assert(/^tmp\/vulcanize.js$/.test(file.path));
			}
		});

		stream.on('end', cb);

		stream.write(new gutil.File({
			cwd: __dirname,
			base: path.join(__dirname, 'tmp'),
			path: path.join('tmp', 'vulcanize.html'),
			contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
		}));

		stream.end();
	});

	it('options test: scriptInHead', function (cb) {
		var stream = crisper({
			scriptInHead: Boolean
		});

		stream.on('data', function (file) {
			var contents = file.contents.toString();

			if (/\.html$/.test(file.path)) {
				assert(/defer=/g.test(contents));
			}
		});

		stream.on('end', cb);

		stream.write(new gutil.File({
			cwd: __dirname,
			base: path.join(__dirname, 'tmp'),
			path: path.join('tmp', 'vulcanize.html'),
			contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
		}));

		stream.end();
	});

	it('options test: onlySplit', function (cb) {
		var stream = crisper({
			onlySplit: Boolean
		});

		stream.on('data', function (file) {
			var contents = file.contents.toString();

			if (/\.html$/.test(file.path)) {
				assert(!/<script/.test(contents));
			}
		});

		stream.on('end', cb);

		stream.write(new gutil.File({
			cwd: __dirname,
			base: path.join(__dirname, 'tmp'),
			path: path.join('tmp', 'vulcanize.html'),
			contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
		}));

		stream.end();
	});

	it('options test: jsFileName', function (cb) {
		var stream = crisper({
			jsFileName: 'script/new-script.js'
		});

		stream.on('data', function (file) {
			var contents = file.contents.toString();

			if (/\.html$/.test(file.path)) {
				assert(/script\/new-script.js/.test(contents));
			}
			if (/\.js$/.test(file.path)) {
				assert(/^tmp\/script\/new-script.js$/.test(file.path));
			}
		});

		stream.on('end', cb);

		stream.write(new gutil.File({
			cwd: __dirname,
			base: path.join(__dirname, 'tmp'),
			path: path.join('tmp', 'vulcanize.html'),
			contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
		}));

		stream.end();
	});
});
