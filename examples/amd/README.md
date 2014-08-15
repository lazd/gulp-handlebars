# Compile templates as AMD modules

This example will show you how to compile templates as AMD modules.

## Dependencies

* [`gulp-define-module`](https://www.npmjs.org/package/gulp-define-module) - Create AMD modules for templates

## Input

This example assumes a directory structure that looks something like this:

```
├── gulpfile.js       # Your gulpfile
└── source/           # Your application's source files
    └── templates/    # A folder containing templates named with dot notation
        ├── App.hbs
        └── App/
        |   ├── header.hbs
        |   ├── footer.hbs
        |   └── etc.hbs
        └── Other.item.hbs
```

## Output

The template files will be compiled as follows:

| File path                       | Template location                |
| ------------------------------- | -------------------------------- |
| source/templates/App.hbs        | build/js/templates/App.js        |
| source/templates/App/header.hbs | build/js/templates/App/header.js |
| source/templates/App/footer.hbs | build/js/templates/App/footer.js |
| source/templates/Other.item.hbs | build/js/templates/Other.item.js |

**Note:** You can have multiple levels of directories under `source/templates/` for deeper nesting.

## Running the example

Type the following commands from the root of this repository:

```
npm install
cd examples/amd
gulp
cat build/js/templates/App.js
```
You should see the following output:

```js
define(["handlebars"], function(Handlebars) { return Handlebars.template(/* compiled template */); });
```

## Usage

#### 1. Install development dependencies:

```shell
npm install --save-dev gulp-handlebars gulp-define-module
```

#### 2. Add the `require()` statements and `template` task to your gulpfile

```js
var gulp = require('gulp');
var defineModule = require('gulp-define-module');
var handlebars = require('gulp-handlebars');

gulp.task('templates', function() {
  // Load templates from the templates/ folder relative to where gulp was executed
  gulp.src('source/templates/**/*.hbs')
    // Compile each Handlebars template source file to a template function
    .pipe(handlebars())
    // Define templates as AMD modules
    .pipe(defineModule('amd'))
    // Write the output into the templates folder
    .pipe(gulp.dest('build/js/templates/'));
});
```

#### 3. Access templates according to their name:
```html
<script>
require(['templates/App/header.js'], function(template) {
  // This will render the template defined by App.header.hbs
  document.body.innerHTML = template();
});
</script>
```

## Optional steps

#### Change the input/output paths

* **Source template location:** Change the glob passed to `gulp.src()`
* **Output directory:** Change the directory passed to `gulp.dest()`
