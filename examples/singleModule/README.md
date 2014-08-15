# Compile all templates to a single Node module

This example will show you how to compile your templates to a single module file for use in your Node or Browserify applications.

Although you can simply `require()` individual compiled template files created using [`gulp-define-module`](https://www.npmjs.org/package/gulp-define-module), this approach may feel simpler to some and can be useful if you want a single point to access all of your templates or want to expose them globally in the browser.

## Dependencies

* [`gulp-declare`](https://www.npmjs.org/package/gulp-declare) - Declare properties and sub-properties
* [`gulp-concat`](https://www.npmjs.org/package/gulp-concat) - Combine output into a single file
* [`gulp-wrap`](https://www.npmjs.org/package/gulp-wrap) - Add `require()` and `Handlebars.template()` statements

## Input

This example assumes a directory structure that looks something like this:

```
├── gulpfile.js   # Your gulpfile
├── index.js      # The main entry point of your application
└── templates/    # A folder containing sub-folders and templates named with dot notation
    ├── App.hbs
    └── App/
    |   ├── header.hbs
    |   ├── footer.hbs
    |   └── etc.hbs
    └── Other.item.hbs
```

## Output

The template files will be compiled to the following properties:

| File path                | Property           |
| ------------------------ | ------------------ |
| templates/App.hbs        | exports.App        |
| templates/App/header.hbs | exports.App.header |
| templates/App/footer.hbs | exports.App.footer |
| templates/Other.item.hbs | exports.Other.item |

**Note:** You can have multiple levels of directories under `templates/` for deeper nesting and can still use dot notation within the filename to nest further if you like.

**Note:** `templates.App.header` is a function that is stored as a property of the `templates.App` function. As everything in JavaScript is an object, even functions, this is perfectly valid and works in all environments. If this hurts your brain, store `templates/App.hbs` as `templates/App/main.hbs` and access it as `templates.App.main`.

## Running the example

Type the following commands from the root of this repository:

```
npm install
cd examples/singleModule
gulp
node index.js
```
You should see the following output:

```js
templates.App.header: <header>Hello!</header>
templates.App: This is the app!
templates.App.footer: <footer>Goodbye!</footer>
templates.Other.item: An item!
```

## Usage

#### 1. Install development dependencies:

```shell
npm install --save-dev gulp-handlebars gulp-wrap gulp-declare gulp-concat
```

#### 2. Copy the `require()` statements and `template` task from `gulpfile.js` into your gulp-define-module

```js
var gulp = require('gulp');
var wrap = require('gulp-wrap');
var concat = require('gulp-concat');
var declare = require('gulp-declare');
var handlebars = require('gulp-handlebars');

gulp.task('templates', function() {
  // Load templates from the templates/ folder relative to where gulp was executed
  gulp.src('templates/**/*.hbs')
    // Compile each Handlebars template source file to a template function
    .pipe(handlebars())
    // Wrap each template function in a call to Handlebars.template
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    // Declare template functions as properties and sub-properties of exports
    .pipe(declare({
      root: 'exports',
      noRedeclare: true, // Avoid duplicate declarations
      processName: function(filePath) {
        // Allow nesting based on path using gulp-declare's processNameByPath()
        // You can remove this option completely if you aren't using nested folders
        // Drop the templates/ folder from the namespace path by removing it from the filePath
        return declare.processNameByPath(filePath.replace('templates/', ''));
      }
    }))
    // Concatenate down to a single file
    .pipe(concat('index.js'))
    // Add the Handlebars module in the final output
    .pipe(wrap('var Handlebars = require("handlebars");\n <%= contents %>'))
    // WRite the output into the templates folder
    .pipe(gulp.dest('templates/'));
});
```

#### 3. Add the following to files in you application that need templates, such as `index.js`:
```js
// The following statement assumes a file in the root of your project, such as index.js
// Adjust the relative path accordingly if accessing templates from other files
var templates = require('./templates');
```

#### 4. Access templates according to their name:
```js
// This will render the template defined by App.header.hbs
var output = templates.App.header();
```

## Optional steps

#### Add `templates/index.js` to your `.gitignore` to avoid committing build output.

If you don't want compiled templates to be committed to your Git repo, be sure to add the output file to `.gitignore`.

#### Change the input/output paths

* **Source template location:** Change the glob passed to `gulp.src()`
* **Output filename:** Change the filename passed to `concat()`
* **Output directory:** Change the directory passed to `gulp.dest()`

#### Simplify code if you don't want to use nested folders

You can achieve the same result without nested folders. The following directory structure will yield identical output:

```
├── index.js      # The main entry point of your application
└── templates     # A folder containing templates named with dot notation
    ├── App.hbs
    ├── App.header.hbs
    ├── App.footer.hbs
    ├── App.etc.hbs
    └── Other.item.hbs
```

You can then drop the `options.processName` function when calling `declare()`:

```js
declare({
  root: 'exports'
  noRedeclare: true // Avoid duplicate delcarations
})
```

This will result in the same output as the above example, but will nest templates based solely on their filename, ignoring nested folders.
