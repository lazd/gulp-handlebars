var gulp = require('gulp');
var concat = require('gulp-concat');
/** REMOVE ME **/ var handlebars = require('../../');
/** USE ME **/ // var handlebars = require('gulp-handlebars');

gulp.task('templates', function() {
  // Load templates from the source/templates/ folder relative to where gulp was executed
  gulp.src('source/templates/**/*.hbs')
    // Compile each Handlebars template source file to a template function using Ember's Handlebars
    .pipe(handlebars({
      handlebars: require('ember-handlebars'),
      compiler: require('ember-cli-htmlbars')
    }))
    // Concatenate down to a single file
    .pipe(concat('templates.js'))
    // Write the output into the templates folder
    .pipe(gulp.dest('build/js/'));
});

// Default task
gulp.task('default', ['templates']);
