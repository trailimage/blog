'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const merge = require('merge2');
const minifyCSS = require('gulp-minify-css');
const concat = require('gulp-concat');
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
gulp.task('less-map', () => LESS('map'));
gulp.task('less-admin', () => LESS('admin'));
gulp.task('less', ['less-main','less-map','less-admin']);

/**
 * Combine web fonts and transpile LESS
 * @param {String} name CSS file name
 * @returns {jQuery.Promise}
 */
function LESS(name) {
	return merge(
		gulp.src('./src/fonts/webfont.css'),
		gulp.src('./src/less/' + name + '.less').pipe(less({ paths: [bsPath + 'less' ] }))
	)
		.pipe(minifyCSS({ advanced: true, keepSpecialComments: 0	}))
		.pipe(concat(name + '.css'))
		.pipe(gulp.dest(dist + 'css'));
}

// copy font files
gulp.task('fonts', function() {
	return merge(
		gulp.src(bsPath + 'fonts/*.*'),
		gulp.src('./src/fonts/!(webfont.css)')
	)
		.pipe(gulp.dest(dist + 'fonts'))
});

gulp.task('script', ['script-post','script-other']);

gulp.task('script-other', function() {
	return gulp.src(jsPath + '!(jquery.lazyload.js|post.js)')
		.pipe(uglify())
		.pipe(gulp.dest(dist + 'js'));
});

gulp.task('script-post', function() {
	return gulp.src([jsPath + 'jquery.lazyload.js', jsPath + 'post.js'])
		.pipe(concat('post.js'))
		.pipe(uglify())
		.pipe(gulp.dest(dist + 'js'));
});

// act on changes
gulp.task('watch', function() {
	gulp.watch('./src/less/*.less', ['less']);
	gulp.watch('./src/js/*.js', ['script']);
});

gulp.task('default', ['less', 'script']);