# gulp-ember-handlebars [![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url]
> Ember Handlebars plugin for gulp 3
[![NPM](https://nodei.co/npm/<package>.png)](https://nodei.co/npm/gulp-ember-handlebars/)

## Usage

First, install `gulp-ember-handlebars` as a development dependency:

```shell
npm install --save-dev gulp-ember-handlebars
```

Then, use the plugin in your `gulpfile.js`:

```javascript
var handlebars = require('gulp-ember-handlebars');

gulp.task('templates', function(){
  gulp.src(['app/templates/*.hbs'])
    .pipe(handlebars({
      outputType: 'amd'
     }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build/js/'));
});
```

## API

#### options.outputType
Type: `String`
Default: `amd`

The desired output type. One of the following:

* `browser` - Produce plain JavaScript files for the browser.
* `amd` - Produce AMD modules.
* `cjs` - Produce CommonJS modules.

### options.templateRoot
Type: `String`
Default: `templates`

This option specifies the name of the root directory for template files.

### options.namespace
Type: `String`
Default: `Ember.TEMPLATES`

This option is only necessary when `options.outputType` is `browser`. This
option's value is the namespace that is assigned the pre-compiled templates.
Use dot notation (e.g. 'Ember.Templates`) for nested namespaces.

### options.processName
Type: `Function`
Default: Strip file extension

This option accepts a function which takes one argument (the template name)
and returns a string which will be used as the key for the precompiled
template object. By default, the filename minus the extension is used.

### options.compilerOptions
Type: `Object`

Compiler options to pass to `Ember.Handlebars.precompile()`.


[travis-url]: http://travis-ci.org/fuseelements/gulp-ember-handlebars
[travis-image]: https://secure.travis-ci.org/fuseelements/gulp-ember-handlebars.png?branch=master
[npm-url]: https://npmjs.org/package/gulp-ember-handlebars
[npm-image]: https://badge.fury.io/gh/fuseelements%2Fgulp-ember-handlebars.png
