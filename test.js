'use strict';

import test from 'ava';
import fs from 'fs';
import path from 'path';
import Vinyl from 'vinyl';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import vulcanize from 'gulp-vulcanize';
import crisper from './';

function copyTestFile(src, dest) {
	fs.writeFileSync(dest, fs.readFileSync(src, 'utf8'));
}

test.beforeEach.cb(t => {
	rimraf.sync('tmp');
	mkdirp.sync('tmp/dist');

	copyTestFile('fixture/index.html', path.join('tmp', 'index.html'));
	copyTestFile('fixture/import.html', path.join('tmp', 'import.html'));

	var stream = vulcanize();

	stream.on('data', function (file) {
		fs.writeFileSync(path.join('tmp', 'vulcanize.html'), file.contents);
	});

	stream.on('end', t.end);

	stream.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'tmp'),
		path: path.join('tmp', 'index.html'),
		contents: fs.readFileSync(path.join('tmp', 'index.html'))
	}));

	stream.end();
});

test.cb('simple-usage', t => {
	var stream = crisper();

	stream.on('data', function (file) {
		var contents = file.contents.toString();
		var rex = {
			js: /Polymer\({/,
			html: /<script src=\"vulcanize.js\".*><\/script>/
		};

		if (/\.html$/.test(file.path)) {
			t.ok(rex.html.test(contents));
		} else if (/\.js$/.test(file.path)) {
			t.ok(rex.js.test(contents));
		} else {
			t.ok(null);
		}
	});

	stream.on('end', t.end);

	stream.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'tmp'),
		path: path.join('tmp', 'vulcanize.html'),
		contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
	}));

	stream.end();
});

test.cb('options test: scriptInHead', t => {
	var stream = crisper({
		scriptInHead: Boolean
	});

	stream.on('data', function (file) {
		var contents = file.contents.toString();

		if (/\.html$/.test(file.path)) {
			t.ok(/defer=/g.test(contents));
		}
	});

	stream.on('end', t.end);

	stream.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'tmp'),
		path: path.join('tmp', 'vulcanize.html'),
		contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
	}));

	stream.end();
});

test.cb('options test: onlySplit', t => {
	var stream = crisper({
		onlySplit: Boolean
	});

	stream.on('data', function (file) {
		var contents = file.contents.toString();

		if (/\.html$/.test(file.path)) {
			t.ok(!/<script/.test(contents));
		}
	});

	stream.on('end', t.end);

	stream.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'tmp'),
		path: path.join('tmp', 'vulcanize.html'),
		contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
	}));

	stream.end();
});

test.cb('options test: jsFileName', t => {
	var stream = crisper({
		jsFileName: 'script/new-script.js'
	});

	stream.on('data', function (file) {
		var contents = file.contents.toString();

		if (/\.html$/.test(file.path)) {
			t.ok(/script\/new-script.js/.test(contents));
		}
	});

	stream.on('end', t.end);

	stream.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'tmp'),
		path: path.join('tmp', 'vulcanize.html'),
		contents: fs.readFileSync(path.join('tmp', 'vulcanize.html'))
	}));

	stream.end();
});
