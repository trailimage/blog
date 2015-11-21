'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const merge = require('merge2');
const minifyCSS = require('gulp-minify-css');
const concat = require('gulp-concat');
const mocha = require('gulp-mocha');
const uglify = require('gulp-uglify');
const dist = './dist/';
const bsPath = './node_modules/bootstrap/';
const jsPath = './src/js/';

/**
 * @see https://github.com/plus3network/gulp-less
 * @see https://github.com/jonathanepollack/gulp-minify-css
 * @see https://github.com/jakubpawlowicz/clean-css/blob/master/README.md
 */
gulp.task('less-main', () => LESS('ti'));
gulp.task('less-map', () => LESS('map', 'mapfont'));
gulp.task('less-admin', () => LESS('admin'));
gulp.task('less', ['less-main','less-map','less-admin']);

/**
 * Combine web fonts and transpile LESS
 * @param {String} name CSS file name
 * @param {String} [fontFile] File created by npm webfont-dl script
 * @returns {jQuery.Promise}
 */
function LESS(name, fontFile) {
	if (fontFile === undefined) { fontFile = 'webfont'; }

	return merge(
		gulp.src(dist + 'fonts/' + fontFile + '.css'),
		gulp.src('./src/less/' + name + '.less').pipe(less({ paths: [bsPath + 'less' ] }))
	)
		.pipe(minifyCSS({ advanced: true, keepSpecialComments: 0 }))
		.pipe(concat(name + '.css'))
		.pipe(gulp.dest(dist + 'css'));
}

gulp.task('script', ['script-post','script-other','script-admin']);

gulp.task('script-other', ()=> {
	return gulp.src(jsPath + '!(jquery.lazyload.js|post.js|admin.js)')
		.pipe(uglify())
		.pipe(gulp.dest(dist + 'js'));
});

gulp.task('script-post', ()=> {
	return gulp.src([jsPath + 'jquery.lazyload.js', jsPath + 'post.js'])
		.pipe(concat('post.js'))
		.pipe(uglify())
		.pipe(gulp.dest(dist + 'js'));
});

gulp.task('script-admin', ()=> {
	return gulp.src([jsPath + 'admin.js'])
		.pipe(uglify())
		.pipe(gulp.dest(dist + 'js'));
});

// act on changes
gulp.task('watch', ()=> {
	gulp.watch('./src/less/*.less', ['less']);
	gulp.watch('./src/js/*.js', ['script']);
});

// https://github.com/sindresorhus/gulp-mocha
// http://mochajs.org/#reporters
gulp.task('test', ()=> {
	return gulp.src('./test/**/*.test.js', { read: false })
		// gulp-mocha needs filepaths so you can't have any plugins before it
		.pipe(mocha({reporter: 'spec'}));
});

gulp.task('default', ['less', 'script']);