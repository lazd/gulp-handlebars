# gulp-handlebars [![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url]
> Handlebars plugin for gulp 3

## Usage

First, install `gulp-handlebars` and [`gulp-define-module`][gulp-define-module] as development dependencies:

```shell
npm install --save-dev gulp-handlebars gulp-define-module
```

Then, add it to your `gulpfile.js`:

```javascript
var handlebars = require('gulp-handlebars');
var defineModule = require('gulp-define-module');

gulp.task('templates', function(){
  gulp.src(['client/templates/*.hbs'])
    .pipe(handlebars())
    .pipe(defineModule('node'))
    .pipe(gulp.dest('build/templates/'));
});
```

gulp-handlebars outputs a raw handlebars function, so it is likely that you will want to use [gulp-define-module] to make the handlebars template available via a specific namespace or for use with a module system. The example above makes this template available for loading via [node's require](http://nodejs.org/api/globals.html#globals_require).

## Compiling to a namespace for the browser

[gulp-define-module] can also be used to make the template accessible via a namespace:

```javascript
var handlebars = require('gulp-handlebars');
var defineModule = require('gulp-define-module');
var concat = require('gulp-concat');

gulp.task('templates', function(){
  gulp.src(['client/templates/*.hbs'])
    .pipe(handlebars())
    .pipe(defineModule('plain', {
      wrapper: 'MyApp.templates['<%= name %>'] = <%= handlebars %>'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build/js/'));
});
```

The above example assumes that MyApp.templates will be defined before the `templates.js` script is included for use in the browser, and will make a file such as `example.hbs` available via `MyApp.templates.example`. See the [gulp-define-module] documentation for more details.

[gulp-declare] is another option that can be used to compile templates for the browser.

```javascript
var handlebars = require('gulp-handlebars');
var defineModule = require('gulp-define-module');
var declare = require('gulp-declare');
var concat = require('gulp-concat');

gulp.task('templates', function(){
  gulp.src(['client/templates/*.hbs'])
    .pipe(handlebars())
    .pipe(defineModule('plain'))
    .pipe(declare({
      namespace: 'MyApp.templates'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build/js/'));
});
```

This will result in a more robust building of the namespace. For a file, `App.Header.hbs`, the result would be:

```javascript
this["MyApp"] = this["MyApp"] || {};
this["MyApp"]["templates"] = this["MyApp"]["templates"] || {};
this["MyApp"]["templates"]["App"] = this["MyApp"]["templates"]["App"] || {};
this["MyApp"]["templates"]["App"]["Header"] = Handlebars.template(function() { /* compiled handlebars template function */});
```

The use of [gulp-define-module] was still needed in this example to get the `Handlebars.template` wrapper.


## Compiling to various module systems

[gulp-define-module] can be used to prepare the output for use with common module systems such as AMD, Node, and CommonJS. Please see the documentation for more details on how to use that in a gulp chain.

gulp-handlebars makes the following available for use in the [define-module wrapper](https://github.com/wbyoung/gulp-define-module#optionswrapper):

 - `handlebars`: The handlebars template fully wrapped (`Handlebars.template(<%= contents %>)`).

gulp-handlebars also sets a default [`require`](https://github.com/wbyoung/gulp-define-module#optionsrequire) of `{ Handlebars: 'handlebars' }` for [gulp-define-module].

## API

### handlebars(options)

#### options.compilerOptions
Type: `Object`

Compiler options to pass to `Handlebars.precompile()`.


[travis-url]: http://travis-ci.org/lazd/gulp-handlebars
[travis-image]: https://secure.travis-ci.org/lazd/gulp-handlebars.png?branch=master
[npm-url]: https://npmjs.org/package/gulp-handlebars
[npm-image]: https://badge.fury.io/js/gulp-handlebars.png

[gulp-define-module]: https://github.com/wbyoung/gulp-define-module
[gulp-handlebars]: https://github.com/lazd/gulp-handlebars
[gulp-declare]: https://github.com/lazd/gulp-declare
