# Namespace templates with nested directories

This example will show you how to compile templates into nested namespaces that correspond to the directories where the templates live.

## Dependencies

* [`gulp-declare`](https://www.npmjs.org/package/gulp-declare) - Declare properties and sub-properties
* [`gulp-concat`](https://www.npmjs.org/package/gulp-concat) - Combine output into a single file
* [`gulp-wrap`](https://www.npmjs.org/package/gulp-wrap) - Add `require()` and `Handlebars.template()` statements

## Input

This example assumes a directory structure that looks something like this:

```
├── gulpfile.js       # Your gulpfile
└── source/           # Your application's source files
    └── templates/    # A folder containing sub-folders and templates named with dot notation
        ├── App.hbs
        └── App/
        |   ├── header.hbs
        |   ├── footer.hbs
        |   └── etc.hbs
        └── Other.item.hbs
```

## Output

The template files will be compiled to the following namespace paths:

| File path                       | Namespace path             |
| ------------------------------- | -------------------------- |
| source/templates/App.hbs        | MyApp.templates.App        |
| source/templates/App/header.hbs | MyApp.templates.App.header |
| source/templates/App/footer.hbs | MyApp.templates.App.footer |
| source/templates/Other.item.hbs | MyApp.templates.Other.item |

**Note:** You can have multiple levels of directories under `source/templates/` for deeper nesting and can still use dot notation within the filename to nest further if you like.

**Note:** `MyApp.templates.App.header` is a function that is stored as a property of the `MyApp.templates.App` function. As everything in JavaScript is an object, even functions, this is perfectly valid and works in all environments. If this hurts your brain, store `source/templates/App.hbs` as `source/templates/App/main.hbs` and access it as `MyApp.templates.App.main`.


## Running the example

Type the following commands from the root of this repository:

```
npm install
cd examples/namespaceByDirectory
gulp
cat build/js/templates.js
```
You should see the following output:

```js
this["MyApp"] = this["MyApp"] || {};
this["MyApp"]["templates"] = this["MyApp"]["templates"] || {};
this["MyApp"]["templates"]["App"] = Handlebars.template(/* compiled template */);
this["MyApp"]["templates"]["Other"] = this["MyApp"]["templates"]["Other"] || {};
this["MyApp"]["templates"]["Other"]["item"] = Handlebars.template(/* compiled template */);
this["MyApp"]["templates"]["App"] = this["MyApp"]["templates"]["App"] || {};
this["MyApp"]["templates"]["App"]["footer"] = Handlebars.template(/* compiled template */);
this["MyApp"]["templates"]["App"]["header"] = Handlebars.template(/* compiled template */);
```

## Usage

Follow these steps to use this approach in your project.

#### 1. Install development dependencies:

```shell
npm install --save-dev gulp-handlebars gulp-wrap gulp-declare gulp-concat
```

#### 2. Add the `require()` statements and `template` task to your gulpfile

```js
var gulp = require('gulp');
var wrap = require('gulp-wrap');
var concat = require('gulp-concat');
var declare = require('gulp-declare');
var handlebars = require('gulp-handlebars');

gulp.task('templates', function() {
  // Load templates from the client/templates/ folder relative to where gulp was executed
  gulp.src('client/templates/**/*.hbs')
    // Compile each Handlebars template source file to a template function
    .pipe(handlebars())
    // Wrap each template function in a call to Handlebars.template
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    // Declare template functions as properties and sub-properties of MyApp.templates
    .pipe(declare({
      namespace: 'MyApp.templates',
      noRedeclare: true, // Avoid duplicate declarations
      processName: function(filePath) {
        // Allow nesting based on path using gulp-declare's processNameByPath()
        // You can remove this option completely if you aren't using nested folders
        // Drop the client/templates/ folder from the namespace path by removing it from the filePath
        return declare.processNameByPath(filePath.replace('client/templates/', ''));
      }
    }))
    // Concatenate down to a single file
    .pipe(concat('templates.js'))
    // Write the output into the build folder
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
document.body.innerHTML = templates.App.header();
</script>
```

## Optional steps

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
  namespace: 'MyApp.templates',
  noRedeclare: true
})
```

This will result in the same output as the above example, but will nest templates based solely on their filename, ignoring nested folders.
