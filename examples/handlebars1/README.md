# Compile templates against Handlebars 1.x

This example will show you how to compile templates using a specific version of Handlebars.

**The runtime you include on the client side MUST match the version you compile templates with.** You cannot use the the 2.x runtime with 1.x templates. This example copies the runtime from `node_modules/handlebars/dist/handlebars.runtime.js` and uses that on the client side. Follow a similar pattern in your application to keep the runtime up to date with the compiler.

## Dependencies

* [`handlebars@1.3.0`](https://www.npmjs.org/package/gulp-define-module) - An older version of handlebars
* [`gulp-declare`](https://www.npmjs.org/package/gulp-declare) - Declare properties and sub-properties
* [`gulp-concat`](https://www.npmjs.org/package/gulp-concat) - Combine output into a single file
* [`gulp-wrap`](https://www.npmjs.org/package/gulp-wrap) - Add `require()` and `Handlebars.template()` statements

## Running the example

Type the following commands from the root of this repository:

```
npm install # install the plugin's dependencies
cd examples/handlebars1
npm install # install Handlebars 1.x locally
gulp
open build/index.html
```
You should see the following output:

```js
This is the app!
```

## Usage

#### 1. Install development dependencies:

```shell
# Note the specific version of Handlebars is specified here
npm install --save-dev gulp-handlebars gulp-wrap gulp-declare gulp-concat handlebars@1.3.0
```

#### 2. Add the `require()` statements and `template` task to your gulpfile

```js
var gulp = require('gulp');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var handlebars = require('gulp-handlebars');

gulp.task('templates', function(){
  gulp.src('source/templates/*.hbs')
    .pipe(handlebars({
      // Pass your local handlebars version
      handlebars: require('handlebars')
    }))
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'MyApp.templates',
      noRedeclare: true // Avoid duplicate declarations
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build/js/'));
});

```

#### 3. Include the `build/js/templates.js` file in your application
```html
<script src="js/templates.js"></script>
```

You may also concatenate into your build output if you like. See [`gulp-concat`](https://www.npmjs.org/package/gulp-concat) for more info.

#### 4. Access templates according to their name:
```html
<script>
  // This will render the template defined by App.header.hbs
  document.querySelector('#app').innerHTML = templates.App.header();
</script>
```
