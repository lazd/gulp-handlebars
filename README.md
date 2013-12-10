# gulp-handlebars

> Handelbars plugin for Gulp

## Usage

First, install `gulp-handlebars` as a development dependency:

```shell
npm install --save-dev gulp-handlebars
```

Then, add it to your `Gulpfile.js`:

```javascript
var jshint = require('gulp-handlebars');

gulp.task('templates', function(){
  gulp.src(['./client/templates/*.hbs'])
    .pipe(handlebars({
      fileName: 'templates.js'
    }))
    .pipe(gulp.dest('build/js/'));
});
```

## Options

### fileName
Type: `String`  

The filename that templates should be compiled to. This option is required.

### namespace
Type: `String`  
Default: `templates`

The namespace in which the precompiled templates will be assigned. *Use dot notation (e.g. `App.Templates`) for nested namespaces or false for no namespace wrapping.*

### processName
Type: `Function`

This option accepts a function which takes one argument (the template filepath) and returns a string which will be used as the key for the precompiled template object. By default, the filename minus the extension is used.

### compilerOptions
Type: `Object`

Compiler options to pass to `Handlebars.precompile()`.
