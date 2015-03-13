var gulp = require('gulp');
var concat = require('gulp-concat');
var wrapAmd = require('gulp-wrap-amd');
var replace = require('gulp-replace');
/** REMOVE ME **/ var handlebars = require('../../');
/** USE ME **/ // var handlebars = require('gulp-handlebars');

var Htmlbars = require('ember-cli-htmlbars');
var compiler = new Htmlbars();

gulp.task('templates', function() {
  // Load templates from the source/templates/ folder relative to where gulp was executed
  gulp.src('source/templates/**/*.hbs')
    // Compile each Handlebars template source file to a template function using Ember's Handlebars
    .pipe(handlebars({
      handlebars: require('ember-handlebars'),
      compiler: compiler.processString
    }))
    .pipe(wrapAmd({
      deps: ['exports'],          // dependency array
      params: ['__exports__'],        // params for callback
      moduleRoot: 'source/',
      modulePrefix: 'rocks/'
    }))
    .pipe(replace(
        /return export default/, 'return __exports__["default"] ='
    ))
    // Concatenate down to a single file
    .pipe(concat('templates.js'))
    // Write the output into the templates folder
    .pipe(gulp.dest('build/js/'));
});

// Default task
gulp.task('default', ['templates']);
