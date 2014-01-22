# gulp-handlebars [![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url]
> Handlebars plugin for gulp 3

## Usage

First, install `gulp-handlebars` as a development dependency:

```shell
npm install --save-dev gulp-handlebars
```

Then, add it to your `gulpfile.js`:

```javascript
var handlebars = require('gulp-handlebars');

gulp.task('templates', function(){
  gulp.src(['client/templates/*.hbs'])
    .pipe(handlebars({
      outputType: 'node'
     }))
    .pipe(gulp.dest('build/templates/'));
});
```

## Compiling to a namespace for the browser

[gulp-declare] can be used to compile templates for the browser. Just pipe the output of gulp-handlebars to gulp-declare:

```javascript
var handlebars = require('gulp-handlebars');
var declare = require('gulp-declare');

gulp.task('templates', function(){
  gulp.src(['client/templates/*.hbs'])
    .pipe(handlebars())
    .pipe(declare({
      namespace: 'MyApp.templates'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build/js/'));
});
```


## API

### handlebars(options)

#### options.outputType
Type: `String`  
Default: `bare`

The desired output type. One of the following:

* `node` - Produce Node modules
* `amd` - Produce AMD modules
* `commonjs` - Produce CommonJS modules
* `bare` - Return an unmolested function definition

#### options.wrapped
Type: `Boolean`  
Default: `false`

Whether to wrap compiled template functions in a call to `Handlebars.template`.

#### options.compilerOptions
Type: `Object`

Compiler options to pass to `Handlebars.precompile()`.


[travis-url]: http://travis-ci.org/lazd/gulp-handlebars
[travis-image]: https://secure.travis-ci.org/lazd/gulp-handlebars.png?branch=master
[npm-url]: https://npmjs.org/package/gulp-handlebars
[npm-image]: https://badge.fury.io/js/gulp-handlebars.png

[gulp-declare]: https://github.com/lazd/gulp-declare