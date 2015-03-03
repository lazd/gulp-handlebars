# Compile and register partials with Handlebars 2.x

This example will show you how to compile partials and templates down to a single file.

The stream merging technique is from gulp's [Using multiple sources in one task recipe](https://github.com/gulpjs/gulp/blob/master/docs/recipes/using-multiple-sources-in-one-task.md).

## Dependencies

* [`handlebars@2.0.0`](https://www.npmjs.org/package/handlebars) - An older version of handlebars
* [`gulp-declare`](https://www.npmjs.org/package/gulp-declare) - Declare properties and sub-properties
* [`gulp-concat`](https://www.npmjs.org/package/gulp-concat) - Combine output into a single file
* [`gulp-wrap`](https://www.npmjs.org/package/gulp-wrap) - Add `require()` and `Handlebars.template()` statements
* [`merge-stream`](https://www.npmjs.org/package/merge-Stream) - Combine templates and partials into a single file stream

## Running the example

Type the following commands from the root of this repository:

```
npm install # install the plugin's dependencies
cd examples/handlebars2-partials
npm install # install the example's dependencies
gulp
open build/index.html
```
You should see the following output:

```js
This is the app!
This is the partial!
```

## Usage

#### 1. Install development dependencies:

```shell
# Note the specific version of Handlebars is specified here
npm install --save-dev gulp-handlebars gulp-wrap gulp-declare gulp-concat merge-stream handlebars@2.0.0
```

#### 2. Add the `require()` statements and `template` task to your gulpfile

```js
var path = require('path');
var gulp = require('gulp');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var handlebars = require('gulp-handlebars');

gulp.task('templates', function() {
  // Assume all partials start with an underscore
  // You could also put them in a folder such as source/templates/partials/*.hbs
  var partials = gulp.src(['source/templates/_*.hbs'])
    .pipe(handlebars())
    .pipe(wrap('Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
      imports: {
        processPartialName: function(fileName) {
          // Strip the extension and the underscore
          // Escape the output with JSON.stringify
          return JSON.stringify(path.basename(fileName, '.js').substr(1));
        }
      }
    }));

  var templates = gulp.src('source/templates/**/[^_]*.hbs')
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
```

#### 3. Include the `build/js/templates.js` file in your application
```html
<script src="js/templates.js"></script>
```

You may also concatenate into your build output if you like. See [`gulp-concat`](https://www.npmjs.org/package/gulp-concat) for more info.

#### 4. Access templates according to their name:
```html
<script>
  // This will render the template defined by App.hbs
  document.querySelector('#app').innerHTML = MyApp.templates.App();
</script>
```
