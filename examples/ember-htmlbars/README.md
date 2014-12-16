# Compile templates for use in Ember.js and HTMLBars

This example will show you how to compile handlebars#2.0.0 templates for use in Ember.js applications with HTMLBars.

## Dependencies

* [`ember-handlebars`](https://www.npmjs.org/package/ember-handlebars) - Compile templates for Ember.js
* [`gulp-concat`](https://www.npmjs.org/package/gulp-concat) - Combine output into a single file
* [`ember-cli-htmlbars`](https://www.npmjs.org/package/ember-cli-htmlbars) - Compile templates for Ember.js with HTMLBars

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

Output could not be used directly within Ember application. You most likely use additional modules like  [`gulp-declare`](https://www.npmjs.org/package/gulp-declare), [`gulp-wrap`](https://www.npmjs.org/package/gulp-wrap), or [`gulp-define-module`](https://www.npmjs.org/package/gulp-define-module). You could find the working example in [Ember-Rocks](https://www.npmjs.com/package/ember-rocks) project.

## Running the example

Type the following commands from the root of this repository:

```
npm install
cd examples/ember-htmlbars
gulp
cat build/js/templates.js
```
You should see the following output:

```js
export default Ember.Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  data.buffer.push("This is the app!");
  },"useData":true})
export default Ember.Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  data.buffer.push("An item!");
  },"useData":true})
export default Ember.Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  data.buffer.push("<footer>Goodbye!</footer>");
  },"useData":true})
export default Ember.Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  data.buffer.push("<header>Hello!</header>");
  },"useData":true})
```

## Usage

#### 1. Install development dependencies:

```shell
npm install --save-dev ember-handlebars gulp-handlebars gulp-concat ember-cli-htmlbars
```

Note: Ember core team is [working on `ember-template-compiler` module](https://github.com/emberjs/ember.js/issues/9911) to have the full features for compiling **HTMLBars**. It will replace `ember-cli-htmlbars` when the API is completed.

#### 2. Add the `require()` statements and `template` task to your gulpfile

```js
var gulp = require('gulp');
var concat = require('gulp-concat');
var handlebars = require('gulp-handlebars');

var Htmlbars = require('ember-cli-htmlbars');
var compiler = new Htmlbars();

gulp.task('templates', function() {
  // Load templates from the source/templates/ folder relative to where gulp was executed
  gulp.src('source/templates/**/*.hbs')
    // Compile each Handlebars template source file to a template function using Ember's Handlebars
    .pipe(handlebars({
      handlebars: require('ember-handlebars'),
      compiler: compiler.processString
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
