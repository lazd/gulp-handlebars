# Compile HTMLBars templates for Ember.js

This example will show you how to compile HtmlBars templates for use in Ember.js applications.

## Dependencies

* [`gulp-concat`](https://www.npmjs.org/package/gulp-concat) - Combine output into a single file
* [`gulp-replace`](https://www.npmjs.com/package/gulp-replace) - A string replace plugin for gulp
* [`gulp-wrap-amd`](https://github.com/phated/gulp-wrap-amd) - Transforming templates to AMD style used in browsers.

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

Output could be used directly within Ember application >1.9.0 and Handlebars >2.0.0 along with HtmlBars. You could find the working example in [Ember-Rocks](https://www.npmjs.com/package/ember-rocks) project.

Note: `ember-rocks` is the gulp version of `ember-cli`.

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
define("rocks/templates/App",["exports"],function(__exports__){

return __exports__["default"] = Ember.HTMLBars.template((function() {
  return {
    isHTMLBars: true,
    blockParams: 0,
    cachedFragment: null,
    hasRendered: false,
    build: function build(dom) {
      var el0 = dom.createTextNode("This is the app!");
      return el0;
    },
    render: function render(context, env, contextualElement) {
      var dom = env.dom;
      dom.detectNamespace(contextualElement);
      var fragment;
      if (this.cachedFragment === null) {
        fragment = this.build(dom);
        if (this.hasRendered) {
          this.cachedFragment = fragment;
        } else {
          this.hasRendered = true;
        }
      }
      if (this.cachedFragment) {
        fragment = dom.cloneNode(this.cachedFragment, true);
      }
      return fragment;
    }
  };
}()));;

});

define("rocks/templates/Other.item",["exports"],function(__exports__){

return __exports__["default"] = Ember.HTMLBars.template((function() {
  return {
    isHTMLBars: true,
    blockParams: 0,
    cachedFragment: null,
    hasRendered: false,
    build: function build(dom) {
      var el0 = dom.createTextNode("An item!");
      return el0;
    },
    render: function render(context, env, contextualElement) {
      var dom = env.dom;
      dom.detectNamespace(contextualElement);
      var fragment;
      if (this.cachedFragment === null) {
        fragment = this.build(dom);
        if (this.hasRendered) {
          this.cachedFragment = fragment;
        } else {
          this.hasRendered = true;
        }
      }
      if (this.cachedFragment) {
        fragment = dom.cloneNode(this.cachedFragment, true);
      }
      return fragment;
    }
  };
}()));;

});

define("rocks/templates/App/footer",["exports"],function(__exports__){

return __exports__["default"] = Ember.HTMLBars.template((function() {
  return {
    isHTMLBars: true,
    blockParams: 0,
    cachedFragment: null,
    hasRendered: false,
    build: function build(dom) {
      var el0 = dom.createElement("footer");
      var el1 = dom.createTextNode("Goodbye!");
      dom.appendChild(el0, el1);
      return el0;
    },
    render: function render(context, env, contextualElement) {
      var dom = env.dom;
      dom.detectNamespace(contextualElement);
      var fragment;
      if (this.cachedFragment === null) {
        fragment = this.build(dom);
        if (this.hasRendered) {
          this.cachedFragment = fragment;
        } else {
          this.hasRendered = true;
        }
      }
      if (this.cachedFragment) {
        fragment = dom.cloneNode(this.cachedFragment, true);
      }
      return fragment;
    }
  };
}()));;

});

define("rocks/templates/App/header",["exports"],function(__exports__){

return __exports__["default"] = Ember.HTMLBars.template((function() {
  return {
    isHTMLBars: true,
    blockParams: 0,
    cachedFragment: null,
    hasRendered: false,
    build: function build(dom) {
      var el0 = dom.createElement("header");
      var el1 = dom.createTextNode("Hello!");
      dom.appendChild(el0, el1);
      return el0;
    },
    render: function render(context, env, contextualElement) {
      var dom = env.dom;
      dom.detectNamespace(contextualElement);
      var fragment;
      if (this.cachedFragment === null) {
        fragment = this.build(dom);
        if (this.hasRendered) {
          this.cachedFragment = fragment;
        } else {
          this.hasRendered = true;
        }
      }
      if (this.cachedFragment) {
        fragment = dom.cloneNode(this.cachedFragment, true);
      }
      return fragment;
    }
  };
}()));;

});
```

## Usage

#### 1. Install development dependencies:

```shell
npm install --save-dev gulp-handlebars gulp-concat gulp-wrap-amd gulp-replace
```

#### 2. Require `ember-template-compiler` module that is paired with your Ember version

Please, read the details [here](http://emberjs.com/blog/2015/02/05/compiling-templates-in-1-10-0.html) for the reason why you need to do this step.

```js
var compiler = require('./bower_components/ember/ember-template-compiler');
```

Example: usage in `gulp-handlebars` plugins as an option - 'compiler'

```js
    ...
    .pipe(handlebars({
      compiler: require('./bower_components/ember/ember-template-compiler').precompile
    }))
    ...
```

#### 3. Add the `require()` statements and `template` task to your gulpfile

```js
var gulp = require('gulp');
var concat = require('gulp-concat');
var wrapAmd = require('gulp-wrap-amd');
var replace = require('gulp-replace');
var handlebars = require('gulp-handlebars');

gulp.task('templates', function() {
  // Load templates from the source/templates/ folder relative to where gulp was executed
  gulp.src('source/templates/**/*.hbs')
    // Compile each Handlebars template source file to a template function using Ember's Handlebars
    .pipe(handlebars({
      compiler: require('./source/ember-template-compiler').precompile
    }))
    .pipe(wrapAmd({
      deps: ['exports'],          // dependency array
      params: ['__exports__'],        // params for callback
      moduleRoot: 'source/',
      modulePrefix: 'rocks/'
    }))
    .pipe(replace(
        /return export default/, 'return __exports__["default"] ='
    ))
    // Concatenate down to a single file
    .pipe(concat('templates.js'))
    // Write the output into the templates folder
    .pipe(gulp.dest('build/js/'));
});

// Default task
gulp.task('default', ['templates']);
```

#### 3. Include the `build/js/templates.js` file in your application
```html
<script src="js/templates.js"></script>
```

You may also concatenate into your build output if you like. See [`gulp-concat`](https://www.npmjs.org/package/gulp-concat) for more info.

#### 4. Use templates with the build tool `ember-rocks`(unofficial) or `ember-cli`(official)
