const gulp = require('gulp');
const less = require('gulp-less');
const merge = require('merge2');
const nano = require('gulp-cssnano');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const dist = './dist/';
const bsPath = './node_modules/bootstrap/';
const jsPath = './src/js/';
// https://github.com/gulp-sourcemaps/gulp-sourcemaps
const sourceMapConfig = {
   sourceMappingURL: file => '/js/maps/' + file.relative + '.map'
}

/**
 * @see https://github.com/plus3network/gulp-less
 * @see https://github.com/jonathanepollack/gulp-minify-css
 * @see https://github.com/jakubpawlowicz/clean-css/blob/master/README.md
 */
gulp.task('less-main', ()=> LESS('ti'));
gulp.task('less-map', ()=> LESS('map', 'mapfont'));
gulp.task('less-mapbox', ()=> LESS('mapbox'));
gulp.task('less-admin', ()=> LESS('admin'));
gulp.task('less', ['less-main', 'less-map', 'less-mapbox', 'less-admin']);

/**
 * Combine web fonts and transpile LESS
 * @param {String} name CSS file name
 * @param {String} [fontFile] File created by npm webfont-dl script
 * @see https://github.com/ben-eb/cssnano
 * @returns {jQuery.Promise}
 */
function LESS(name, fontFile) {
   if (fontFile === undefined) { fontFile = 'webfont'; }

   return merge(
      gulp.src(dist + 'fonts/' + fontFile + '.css'),
      gulp.src('./src/less/' + name + '.less')
         .pipe(less({ paths: [bsPath + 'less'] })).on('error', handleError)
   )
      .on('error', handleError)
      .pipe(nano({ discardUnused: false }))
      .pipe(concat(name + '.css'))
      .pipe(gulp.dest(dist + 'css'));
}

/**
 * Handle error
 * @param {object} error
 * @see http://stackoverflow.com/questions/23971388/prevent-errors-from-breaking-crashing-gulp-watch
 */
function handleError(error) { console.error(error); this.emit('end'); }

gulp.task('script', ['script-post', 'script-other', 'script-admin']);

gulp.task('script-other', ()=>
   gulp.src(jsPath + '!(jquery.lazyload.js|post.js|admin.js)')
      .pipe(sourcemaps.init())
      .pipe(uglify()).on('error', handleError)
      // https://github.com/gulp-sourcemaps/gulp-sourcemaps
      .pipe(sourcemaps.write('maps', sourceMapConfig))
      .pipe(gulp.dest(dist + 'js'))
);

gulp.task('script-post', ()=>
   gulp.src([jsPath + 'jquery.lazyload.js', jsPath + 'post.js'])
      .pipe(concat('post.js'))
      .pipe(sourcemaps.init())
      .pipe(uglify()).on('error', handleError)
      .pipe(sourcemaps.write('maps', sourceMapConfig))
      .pipe(gulp.dest(dist + 'js'))
);

gulp.task('script-admin', ()=>
   gulp.src([jsPath + 'admin.js'])
      .pipe(sourcemaps.init())
      .pipe(uglify()).on('error', handleError)
      .pipe(sourcemaps.write('maps', sourceMapConfig))
      .pipe(gulp.dest(dist + 'js'))
);

// act on changes
gulp.task('watch', ()=> {
   gulp.watch('./src/less/*.less', ['less']);
   gulp.watch('./src/js/*.js', ['script']);
});

gulp.task('default', ['less', 'script']);