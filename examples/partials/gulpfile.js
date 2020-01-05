var path = require('path');
var gulp = require('gulp');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var merge = require('merge-stream');
/** REMOVE ME **/ var handlebars = require('../../');
/** USE ME **/ // var handlebars = require('gulp-handlebars');

gulp.task('templates', function() {
  // Assume all partials are in a folder such as source/partials/**/*.hbs
  var partials = gulp.src(['source/partials/**/*.hbs'])
    .pipe(handlebars())
    .pipe(wrap('Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
      imports: {
        processPartialName: function(fileName) {
          // Strip the extension and the underscore
          // Escape the output with JSON.stringify
          return JSON.stringify(path.basename(fileName, '.js'));
        }
      }
    }));

  var templates = gulp.src('source/templates/**/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'MyApp.templates',
      noRedeclare: true // Avoid duplicate declarations
    }));

  // Output both the partials and the templates as build/js/templates.js
  return merge(partials, templates)
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build/js/'));
});

gulp.task('copy-js', function(){
  return gulp.src('node_modules/handlebars/dist/handlebars.runtime.js')
    .pipe(gulp.dest('build/js/'));
});

gulp.task('copy-html', function(){
  return gulp.src('source/index.html')
    .pipe(gulp.dest('build/'));
});

// Default task
gulp.task('default', gulp.series(gulp.parallel('copy-js', 'copy-html'), 'templates'));
