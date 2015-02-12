var gulp = require('gulp');
var header = require('gulp-header');
var rename = require('gulp-rename');
var uglify = require('gulp-uglifyjs');

var paths = require('../paths');
var pkg = require('../../package.json');

var banner = [
  '/*',
  '   Angular.Responsive',
  '   ------------------',
  '   v<%= pkg.version %>',
  '   Copyright (c) 2015 Mattias Rydengren <mattias.rydengren@coderesque.com>',
  '   Distributed under MIT license',
  '*/',
  ''
].join('\n');

gulp.task('build', ['clean'], function() {
  return gulp.src(paths.source)
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest(paths.output))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify({ outSourceMap: true, preserveComments: 'all' }))
    .pipe(gulp.dest(paths.output));
});