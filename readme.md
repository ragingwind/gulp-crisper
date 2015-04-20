# gulp-crisper

> Gulp plugin for [Crisper](https://github.com/PolymerLabs/crisper) that split inline scripts from an HTML file for CSP compliance

*Issues with the output should be reported on the `Crisper` [issue tracker](https://github.com/PolymerLabs/crisper/issues).*


## Install

```
$ npm install --save-dev gulp-crisper
```


## Usage

```js
var gulp = require('gulp');
var vulcanize = require('gulp-vulcanize');
var crisper = require('gulp-crisper');

gulp.task('default', function () {
	return gulp.src('src/index.html')
		.pipe(vulcanize({
			abspath: '',
			excludes: [],
			stripExcludes: false,
			inlineScripts: false
		}))
		.pipe(crisper());
		.pipe(gulp.dest('dest'));
});
```

## License

MIT © [Jimmy Moon](http://ragingwind.me)
