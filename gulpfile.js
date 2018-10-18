var gulp = require('gulp');
var del = require('del');
var inject = require('gulp-inject');
var webserver = require('gulp-webserver');
var htmlclean = require('gulp-htmlclean');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var paths = {
	src: 'src/**/*',
  srcHTML: './*.html',
  srcCSS: './*.css',
  srcJS: './*.js',

	tmp: 'tmp',
  tmpIndex: './*.html',
  tmpCSS: './*.css',
  tmpJS: './*.js',

  dist: 'dist',
  distIndex: './*.html',
  distCSS: './*.css',
  distJS: './*.js'
};
var srcPath = [
  '**/*',
  '!gulpfile.js',
  '!.*'
];
/**
 * DEVELOPMENT
 */
gulp.task('html', function () {
  return gulp.src(paths.srcHTML).pipe(gulp.dest(paths.dist));
});
gulp.task('css', function () {
  return gulp.src(paths.srcCSS).pipe(gulp.dest(paths.dist));
});
gulp.task('js', function () {
  return gulp.src(paths.srcJS).pipe(gulp.dest(paths.dist));
});

gulp.task('copy', ['html', 'css', 'js']);

gulp.task('inject', ['copy'], function () {
  var css = gulp.src(paths.tmpCSS);
  var js = gulp.src(paths.tmpJS);
  return gulp.src(paths.tmpIndex)
    .pipe(inject( css, { relative:true } ))
    .pipe(inject( js, { relative:true } ))
    .pipe(gulp.dest(paths.tmp));
});

gulp.task('serve', ['inject'], function () {
  return gulp.src(paths.dist)
    .pipe(webserver({
      port: 4000,
			livereload: true
    }));
});

gulp.task('watch', ['serve'], function () {
	gulp.watch(paths.src, ['inject']);
});

gulp.task('default', ['watch']);
/**
 * DEVELOPMENT END
 */

gulp.task('dist',() => {
  gulp.src('node_modules/**/*').pipe(gulp.dest('./dist/node_modules'));
})

/**
 * PRODUCTION
 */
gulp.task('html:dist', function () {
  return gulp.src(paths.srcHTML)
    .pipe(htmlclean())
    .pipe(gulp.dest(paths.dist));
});
gulp.task('css:dist', function () {
  return gulp.src(paths.srcCSS)
    .pipe(concat('style.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.dist));
});
gulp.task('js:dist', function () {
  return gulp.src(paths.srcJS)
    .pipe(concat('script.min.js'))
    .pipe(gulp.dest(paths.dist));
});
// gulp.task('dist',['inject:dist'])
gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist']);
gulp.task('inject:dist', ['copy:dist'], function () {
  var css = gulp.src(paths.distCSS);
  var js = gulp.src(paths.distJS);
  return gulp.src(paths.distIndex)
    .pipe(inject( css, { relative:true } ))
    .pipe(inject( js, { relative:true } ))
    .pipe(gulp.dest(paths.dist));
});
gulp.task('build',function () {
  return gulp.src(srcPath)
    .pipe(gulp.dest('dist/'))
});
/**
 * PRODUCTION END
 */

gulp.task('clean', function () {
  del([paths.tmp, paths.dist]);
});
