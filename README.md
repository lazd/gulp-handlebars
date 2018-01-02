# gulp-handlebars [![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url]
> Handlebars plugin for gulp

## Usage

Install `gulp-handlebars` as a development dependency:

```shell
npm install --save-dev gulp-handlebars
```

## VERSION MISMATCH ERROR?!

Are you seeing this error when using pre-compliled templates?

```
Error: Template was precompiled with an older version of Handlebars
```

If you're getting a version mismatch error when using pre-compliled templates, **install the handlebars version of your choice and pass it as [`options.handlebars`](#optionshandlebars)**, then include the appropriate runtime in your client-side application.

Here's how you install your own version of handlebars:

```
npm install --save handlebars@^4.0.0
```

And here's how you use that verison of handlebars in `gulp-handlebars`:

```js
handlebars({
  handlebars: require('handlebars')
})
```

The runtime is located in:

```
node_modules/handlebars/dist/handlebars.js
```

## Compiling templates for the browser

[`gulp-declare`][gulp-declare] and [`gulp-wrap`][gulp-wrap] can be used to safely declare template namespaces and make templates available for use in the browser.

First, install development dependencies:

```shell
npm install --save-dev gulp-handlebars gulp-wrap gulp-declare gulp-concat
```

Given the following directory structure:

```
├── gulpfile.js              # Your gulpfile
└── source/                  # Your application's source files
    └── templates/           # A folder containing templates named with dot notation
        └── home.header.hbs  # A template that will be available as MyApp.templates.home.header
```

To compile all templates in `source/templates/` to `build/js/templates.js` under the `MyApp.templates` namespace:

#### gulpfile.js
```js
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');

gulp.task('templates', function(){
  gulp.src('source/templates/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'MyApp.templates',
      noRedeclare: true, // Avoid duplicate declarations
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build/js/'));
});
```

The template's filename is combined with the namespace, so the resulting `build/js/templates.js` would look like:

```js
this["MyApp"] = this["MyApp"] || {};
this["MyApp"]["templates"] = this["MyApp"]["templates"] || {};
this["MyApp"]["templates"]["home"] = this["MyApp"]["templates"]["home"] || {};
this["MyApp"]["templates"]["home"]["header"] = Handlebars.template(function() { /* compiled template function */ });
```

## Namespace templates according to nested directories

See the [namespaceByDirectory example](examples/namespaceByDirectory) if you'd like to compile templates with a mapping that looks like this:

| File path                       | Namespace path             |
| ------------------------------- | -------------------------- |
| source/templates/App.hbs        | MyApp.templates.App        |
| source/templates/App/header.hbs | MyApp.templates.App.header |
| source/templates/App/footer.hbs | MyApp.templates.App.footer |
| source/templates/Other.item.hbs | MyApp.templates.Other.item |


## Compiling to various module systems

See the [`gulp-define-module` documentation][gulp-define-module documentation] for details on how to define templates as AMD, Node, CommonJS, and hybrid modules.

See the [amd example](examples/amd) for a full example of compiling templates to AMD modules.

`gulp-handlebars` makes the following available for use in `gulp-define-module`'s [`wrapper` template option](https://github.com/wbyoung/gulp-define-module#optionswrapper):

 - `<%= handlebars %>` - The Handlebars template, wrapped in a call to `Handlebars.template()`
 - `<%= contents %>` - The bare Handlebars template (not wrapped).

`gulp-handlebars` also sets a default [`options.require`](https://github.com/wbyoung/gulp-define-module#optionsrequire) of `{ Handlebars: 'handlebars' }` for [`gulp-define-module`][gulp-define-module] so Handlebars will be present in when defining AMD, Node, CommonJS, or hybrid modules. You can change this by passing a different `options.require` when you invoke `gulp-define-module`.


## Compiling partials

The following example will precompile and register partials for all `.hbs` files in `source/templates/` that start with an underscore, then store the result as `build/js/partials.js`;

```javascript
var path = require('path');
var gulp = require('gulp');
var wrap = require('gulp-wrap');
var concat = require('gulp-concat');
var handlebars = require('gulp-handlebars');

gulp.task('partials', function() {
  // Assume all partials start with an underscore
  // You could also put them in a folder such as source/templates/partials/*.hbs
  gulp.src(['source/templates/_*.hbs'])
    .pipe(handlebars())
    .pipe(wrap('Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
      imports: {
        processPartialName: function(fileName) {
          // Strip the extension and the underscore
          // Escape the output with JSON.stringify
          return JSON.stringify(path.basename(fileName, '.js').substr(1));
        }
      }
    }))
    .pipe(concat('partials.js'))
    .pipe(gulp.dest('build/js/'));
});
```

See the [partials example](examples/partials) for a full example that compiles partials and templates down to a single file.


## Compiling using a specific Handlebars version

You can use different versions of Handlebars by specifying the version in your `package.json` and passing it as `options.handlebars`:

#### package.json
```json
{
  "devDependencies": {
    "handlebars": "^1.3.0"
  }
}
```

#### gulpfile.js
```js
gulp.task('templates', function(){
  gulp.src('source/templates/*.hbs')
    .pipe(handlebars({
      handlebars: require('handlebars')
    }))
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'MyApp.templates',
      noRedeclare: true, // Avoid duplicate declarations
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build/js/'));
});
```

**The runtime you include on the client side MUST match the version you compile templates with.** You cannot use the the 2.x runtime with 1.x templates. The [handlebars1 example](examples/handlebars1) copies the runtime from `node_modules/handlebars/dist/handlebars.runtime.js` and uses that on the client side. Follow a similar pattern in your application to keep the runtime up to date with the compiler.

## Compiling to separate modules for Node/Browserify

This example will make templates available for loading via [Node's require](http://nodejs.org/api/globals.html#globals_require):

#### gulpfile.js
```js
var handlebars = require('gulp-handlebars');
var defineModule = require('gulp-define-module');

gulp.task('templates', function(){
  gulp.src(['templates/*.hbs'])
    .pipe(handlebars())
    .pipe(defineModule('node'))
    .pipe(gulp.dest('build/templates/'));
});
```

Templates can then be used within Node as such:

```js
var appTemplate = require('./build/templates/App.Header.js');
var html = appTemplate(data);
```

## Compiling to a single module for use in Node/Browserify

See the [singleModule example](examples/singleModule) if you'd like to have a single module that contains all of your templates that can be used like so:

#### yourApp.js
```js
var templates = require('./templates');
var output = templates.App.header();
```

## Processing the generated template AST

The example below removes any partial and replaces it with the text `foo`.

#### gulpfile.js
```js
handlebars({
  processAST: function(ast) {
    ast.statements.forEach(function(statement, i) {
      if (statement.type === 'partial') {
        ast.statements[i] = { type: 'content', string: 'foo' };
      }
    });
  }
})
```

## Using HTMLBars with Ember

See the [ember-htmlbars example](examples/ember-htmlbars) for details

```js
handlebars({
  handlebars: emberHandlebars,
  compiler: emberTemplateCompilerFunction
})
```

## API

### handlebars(options)

#### options.compilerOptions
Type: `Object`

Compiler options to pass to `Handlebars.precompile()`.

#### options.processAST
Type: `Function`

A function which will be passed the parsed Handlebars Abstract Syntax Tree. You can modify the AST in place or return a new AST to change the source of the precompiled template.

#### options.handlebars
Type: `Object`

Handlebars library to use for precompilation. By default, the latest stable version of Handlebars is used.

#### options.compiler
Type: `Function`

Custom compiler function. By default, the precompile method of the provided Handlebars module is used (see [options.handlebars](#handlebarsoptions)).



[travis-url]: http://travis-ci.org/lazd/gulp-handlebars
[travis-image]: https://secure.travis-ci.org/lazd/gulp-handlebars.png?branch=master
[npm-url]: https://npmjs.org/package/gulp-handlebars
[npm-image]: https://badge.fury.io/js/gulp-handlebars.png

[gulp-define-module documentation]: https://www.npmjs.org/package/gulp-define-module#definemodule-type-options-
[gulp-define-module]: https://www.npmjs.org/package/gulp-define-module
[gulp-declare]: https://www.npmjs.org/package/gulp-declare
[gulp-wrap]: https://www.npmjs.org/package/gulp-wrap
