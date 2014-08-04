var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var prefix = require('gulp-autoprefixer');
var del = require('del');

var pluginName = 'happymodal';

var paths = {
  scripts: 'src/jquery.' + pluginName + '.js',
  styles: 'src/' + pluginName + '.css'
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build'], cb);
});

gulp.task('scripts', ['clean'], function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(concat('jquery.' + pluginName + '.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./'));
});

gulp.task('styles', ['clean'], function() {
  return gulp.src(paths.styles)
    .pipe(sourcemaps.init())
      .pipe(minify())
      .pipe(concat(pluginName + '.min.css'))
    .pipe(prefix("last 2 version", "ie 9", { cascade: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts', 'styles']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'scripts', 'styles']);