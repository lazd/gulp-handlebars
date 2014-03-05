'use strict';

var stream = require('stream'),
    path = require('path'),
    compiler = require('ember-template-compiler');


// Default name function returns the template filename without extension.
var defaultProcessName = function (name) {
  var n = path.extname(name).length;
  return n === 0 ? name : name.slice(0, -n);
};


/**
 * @param {String} templateRoot Is the templates directory name (i.e., "templates").
 * @param {String} name Is the template name without any extensions.
 * @param {String} compiled Is the pre-compiled Ember.Handlebars template text.
 *
 * @returns {String} Returns a compiled Ember.Handlebars template text using an AMD-style module wrapper.
 */
function toAMD(templateRoot, name, compiled) {
  // 'define("<%= moduleName %>", function () { return Ember.TEMPLATES["<%= name %>"] = <%= compiled %> });'
  return 'define("'.concat(templateRoot, '/', name, '", function () { return Ember.TEMPLATES["', name, '"] = ', compiled, ' });');
}


/**
 * @param {String} namespace Is the name used in browser global assignment.
 * @param {String} name Is the template name without any extensions.
 * @param {String} compiled Is the pre-compiled Ember.Handlebars template text.
 *
 * @returns {String} Returns a compiled Ember.Handlebars template text for use directly in the browser.
 */
function toBrowser(namespace, name, compiled) {
  // '<%= namespace %>["<%= name %>"] = <%= compiled %>'
  return namespace.concat('["', name, '"] = ', compiled);
}


/**
 * @param {String} name Is the template name without any extensions.
 * @param {String} compiled Is the pre-compiled Ember.Handlebars template text.
 *
 * @returns {String} Returns a compiled Ember.Handlebars template text using an CommonJS-style module wrapper.
 */
function toCommonJS(name, compiled) {
  // 'module.exports = Ember.TEMPLATES["<%= name %>"] = <%= compiled %>'
  return 'module.exports = Ember.TEMPLATES["'.concat(name, '"] = ', compiled);
}


module.exports = function (options) {
  var outputType = options.outputType || 'browser', // amd, browser, cjs
      namespace = options.namespace || 'Ember.TEMPLATES',
      templateRoot = options.templateRoot || 'templates',
      processName = options.processName || defaultProcessName,
      compilerOptions = options.compilerOptions || {},
      ts = new stream.Transform({objectMode: true});

  ts._transform = function (file, encoding, callback) {
    var name,
        finish;

    finish = function (stream) {
      stream.push(file);
      callback();
    };

    // Check possible guard cases.
    if (file.isNull()) {
      // Pass through unscathed.
      finish(this);
      return;
    }
    if (file.isStream()) {
      callback(new Error('gulp-ember-handlebars: Streaming is not supported.'));
      return;
    }

    // Get the name of the template
    name = file.relative;
    // Look out for those pesky windows path separators
    name = name.replace(/\\/g, '/');
    // Allow the user a chance to transform the name
    name = processName(name);

    // Perform pre-compilation
    try {
      var compiled = compiler.precompile(file.contents.toString(), compilerOptions);
    } catch (e) {
      callback(new Error(e));
      return;
    }

    // Surround the raw output as an Ember.Handlebars.template.
    compiled = 'Ember.Handlebars.template('.concat(compiled, ');');

    switch (outputType) {
    case 'amd':
      compiled = toAMD(templateRoot, name, compiled);
      break;
    case 'browser':
      compiled = toBrowser(namespace, name, compiled);
      break;
    case 'cjs':
      compiled = toCommonJS(name, compiled);
      break;
    default:
      callback(new Error('Invalid output type: ' + outputType));
    }

    file.path = path.join(path.dirname(file.path), path.basename(name) + '.js');
    file.contents = new Buffer(compiled);

    finish(this);
  };

  return ts;
};
