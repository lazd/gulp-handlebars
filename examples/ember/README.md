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

The templates will be compiled down as follows:

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
cd examples/ember
gulp
cat build/js/templates.js
```
You should see the following output:

```js
this["Ember"] = this["Ember"] || {};
this["Ember"]["TEMPLATES"] = this["Ember"]["TEMPLATES"] || {};
this["Ember"]["TEMPLATES"]["App"] = Ember.Handlebars.template(/* compiled template */);
this["Ember"]["TEMPLATES"]["Other"] = this["Ember"]["TEMPLATES"]["Other"] || {};
this["Ember"]["TEMPLATES"]["Other"]["item"] = Ember.Handlebars.template(/* compiled template */);
this["Ember"]["TEMPLATES"]["App"] = this["Ember"]["TEMPLATES"]["App"] || {};
this["Ember"]["TEMPLATES"]["App"]["footer"] = Ember.Handlebars.template(/* compiled template */);
this["Ember"]["TEMPLATES"]["App"]["header"] = Ember.Handlebars.template(/* compiled template */);
```

## Usage

#### 1. Install development dependencies:

```shell
npm install --save-dev ember-handlebars gulp-handlebars gulp-declare gulp-concat gulp-wrap
```

#### 2. Add the `require()` statements and `template` task to your gulpfile

```js
var gulp = require('gulp');
var wrap = require('gulp-wrap');
var concat = require('gulp-concat');
var declare = require('gulp-declare');
var handlebars = require('gulp-handlebars');

gulp.task('templates', function() {
  // Load templates from the source/templates/ folder relative to where gulp was executed
  gulp.src('source/templates/**/*.hbs')
    // Compile each Handlebars template source file to a template function using Ember's Handlebars
    .pipe(handlebars({
      handlebars: require('ember-handlebars')
    }))
    // Wrap each template function in a call to Ember.Handlebars.template
    .pipe(wrap('Ember.Handlebars.template(<%= contents %>)'))
    // Declare template functions with Ember.TEMPLATES according to their path and filename
    .pipe(declare({
      namespace: 'Ember.TEMPLATES',
      noRedeclare: true, // Avoid duplicate declarations
      processName: function(filePath) {
        // Allow nesting based on path using gulp-declare's processNameByPath()
        // You can remove this option completely if you aren't using nested folders
        // Drop the source/templates/ folder from the namespace path by removing it from the filePath
        return declare.processNameByPath(filePath.replace('source/templates/', ''));
      }
    }))
    // Concatenate down to a single file
    .pipe(concat('templates.js'))
    // Write the output into the templates folder
    .pipe(gulp.dest('build/js/'));
});
```

#### 3. Include the `build/js/templates.js` file in your application
```html
<script src="js/templates.js"></script>
```

You may also concatenate into your build output if you like. See [`gulp-concat`](https://www.npmjs.org/package/gulp-concat) for more info.

#### 4. Use templates in your Ember views:
```html
<script>
  var HeaderView = Ember.View.extend({
    template: Ember.TEMPLATES.App.header
  });
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
  root: 'exports'
  noRedeclare: true // Avoid duplicate delcarations
})
```

This will result in the same output as the above example, but will nest templates based solely on their filename, ignoring nested folders.
