const gulp = require('gulp');
const less = require('gulp-less');
const nano = require('gulp-cssnano');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const filter = require('gulp-filter');
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

const tsConfig = ts.createProject('tsconfig.browser.json');

/**
 * @param {string[]} names
 * @returns {string[]}
 */
const lessPath = names => names.map(n => './src/less/' + n + '.less');

const only = names => names.map(n => '**/' + n + '*');
const none = names => ['**'].concat(names.map(n => '!**/' + n + '*'));

/**
 * Handle error so file watcher can continue
 * @param {object} error
 * @see http://stackoverflow.com/questions/23971388/prevent-errors-from-breaking-crashing-gulp-watch
 */
function handleError(error) { console.error(error); this.emit('end'); }

function bundle() {
   
}

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
gulp.task('js', ()=> {
   const onlyPostPage = filter(only(['post','static-map','*lazyload']), { restore: true });
   const onlyCategoryPage = filter('**/static-map*', { restore: true });

   return merge(
      tsConfig.src().pipe(tsConfig()),
      gulp.src(jsPath + 'jquery.lazyload.js')
   )  
      .pipe(onlyPostPage)
      .pipe(concat('post.js'))
      .pipe(onlyPostPage.restore)
      // combine sources for category page
      .pipe(onlyCategoryPage)
      .pipe(concat('category.js'))
      .pipe(gulp.dest(dist + 'js'))
      .pipe(onlyCategoryPage.restore)
      // map, compress and output non-merged sources
      .pipe(removeMerged)      
      .pipe(sourcemaps.init())
      .pipe(uglify()).on('error', handleError)
      .pipe(sourcemaps.write('maps', sourceMapConfig))
      .pipe(gulp.dest(dist + 'js'));
});

function js(glob) {

}

// act on changes
gulp.task('watch', ()=> {
   gulp.watch('./src/less/*.less', ['css']);
   gulp.watch('./src/client/*.?s', ['js']);
});