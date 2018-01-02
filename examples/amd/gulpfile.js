var gulp = require('gulp');
var defineModule = require('gulp-define-module');
/** REMOVE ME **/ var handlebars = require('../../');
/** USE ME **/ // var handlebars = require('gulp-handlebars');

gulp.task('default', function() {
  // Load templates from the templates/ folder relative to where gulp was executed
  return gulp.src('source/templates/**/*.hbs')
    // Compile each Handlebars template source file to a template function
    .pipe(handlebars())
    // Define templates as AMD modules
    .pipe(defineModule('amd'))
    // Write the output into the templates folder
    .pipe(gulp.dest('build/js/templates/'));
});
