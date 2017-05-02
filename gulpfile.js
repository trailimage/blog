const gulp = require('gulp');
const less = require('gulp-less');
const nano = require('gulp-cssnano');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const merge = require('merge2');
const jsPath = './src/client/'
const dist = './dist/';
/**
 * https://github.com/gulp-sourcemaps/gulp-sourcemaps
 */
const sourceMapConfig = {
   sourceMappingURL: file => '/js/maps/' + file.relative + '.map'
}

/**
 * Cannot use the same project twice in one pipeline
 */
const tsConfig = [
   ts.createProject('tsconfig.browser.json'),
   ts.createProject('tsconfig.browser.json')
]

/**
 * @param {string[]} names
 * @returns {string[]}
 */
const lessPath = names => names.map(n => './src/less/' + n + '.less');

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
      gulp.src([`${jsPath}*.ts`, `!${jsPath}post.ts`]).pipe(tsConfig[0]()),
      // merge post and lazy-load plugin into single file
      merge(
         gulp.src(jsPath + 'post.ts').pipe(tsConfig[1]()),
         gulp.src(jsPath + 'jquery.lazyload.js')
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
   gulp.watch('./src/client/*.?s', ['js']);
});