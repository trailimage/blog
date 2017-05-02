const gulp = require('gulp');
const less = require('gulp-less');
const nano = require('gulp-cssnano');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const merge = require('merge2');
const dist = './dist/';
// https://github.com/gulp-sourcemaps/gulp-sourcemaps
const sourceMapConfig = {
   sourceMappingURL: file => '/js/maps/' + file.relative + '.map'
}
const tsProject1 = ts.createProject('tsconfig.browser.json');
const tsProject2 = ts.createProject('tsconfig.browser.json');

/**
 * @param {string[]} names
 * @returns {string[]}
 */
const lessPath = names => names.map(n => './src/less/' + n + '.less');
/**
 * @param {string[]} names
 * @returns {string[]}
 */
const jsPath = names => names.map(n => './src/client/' + n);

/**
 * Handle error so file watcher can continue
 * @param {object} error
 * @see http://stackoverflow.com/questions/23971388/prevent-errors-from-breaking-crashing-gulp-watch
 */
function handleError(error) { console.error(error); this.emit('end'); }

// https://github.com/plus3network/gulp-less
// https://github.com/jonathanepollack/gulp-minify-css
// https://github.com/jakubpawlowicz/clean-css/blob/master/README.md
gulp.task('css', ()=>
   merge(
      gulp.src(lessPath(['map', 'mapbox', 'admin'])).pipe(less()).on('error', handleError),
      merge(
         // combine fonts with main styles
         gulp.src(lessPath(['ti'])).pipe(less()).on('error', handleError),
         gulp.src(dist + 'fonts/webfont.css')
      )
         .pipe(concat('ti.css'))
   )
      .pipe(less()).on('error', handleError)
      .pipe(nano({ discardUnused: false })).on('error', handleError)
      .pipe(gulp.dest(dist + 'css'))
);

// https://github.com/gulp-sourcemaps/gulp-sourcemaps
gulp.task('js', ()=>
   merge(
      gulp.src(['./src/client/*.ts', '!./src/client/post.ts']).pipe(tsProject1()),
      merge(
         gulp.src('./src/client/post.ts').pipe(tsProject2()),
         gulp.src('./src/client/jquery.lazyload.js')
      )
         .pipe(concat('post.js'))
   )
      .pipe(sourcemaps.init())
      .pipe(uglify()).on('error', handleError)
      .pipe(sourcemaps.write('maps', sourceMapConfig))
      .pipe(gulp.dest(dist + 'js'))
);

// act on changes
gulp.task('watch', ()=> {
   gulp.watch('./src/less/*.less', ['css']);
   gulp.watch('./src/client/*.js', ['js']);
});