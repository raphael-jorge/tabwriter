'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');
var eslint = require('gulp-eslint');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var babelify = require('babelify');

gulp.task('default', ['watch']);

gulp.task('build', ['sass', 'build-js']);

gulp.task('sass', function () {
  return gulp.src('./public/css/src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css/build'))
    .pipe(browserSync.stream());
});

gulp.task('build-js', function() {
  return browserify('./public/js/src/main.js')
    .transform('babelify', {presets: ['env']})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/build'))
    .pipe(browserSync.stream());
});

gulp.task('lint', function() {
  return gulp.src(['./**/*.js', '!node_modules/**', '!./public/js/build/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init({
    proxy: 'localhost:3000',
    port: '3001',
    ui:{
      port: '3002'
    }
  });
});

gulp.task('nodemon', function() {
  nodemon({
    script: 'app.js'
  });
});

gulp.task('watch', ['browser-sync', 'sass', 'build-js'], function () {
  gulp.watch('./public/css/src/**/*.scss', ['sass']);
  gulp.watch(['./public/jsv2/**/*.js', '!./public/jsv2/bundle.js'], ['build-js']);
  gulp.watch('./public/js/**/*.js', browserSync.reload);
  gulp.watch('./views/**/*.ejs', browserSync.reload);
});
