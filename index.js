'use strict';

var es = require('event-stream'),
    path = require('path'),
    gutil = require('gulp-util'),
    compiler = require('ember-template-compiler');


// Default name processing function should give the filename without extension
var defaultProcessName = function (name) { return path.basename(name, path.extname(name)); };


/**
 * @param {File} file Is the gulp.File
 * @param {String} templateRoot Is the templates directory name (i.e., "templates").
 * @param {String} name Is the template name without any extensions.
 * @param {String} compiled Is the pre-compiled Ember.Handlebars template text.
 * @param {String} namespace Is the name used in browser global assignment.
 *
 * @return {Object} Return a template context used by the wrapper functions.
 */
function ctx(file, templateRoot, name, compiled, namespace) {
  var pathParts = file.path.split('/'),
      templatePartIndex = pathParts.lastIndexOf(templateRoot),
      moduleName = pathParts.slice(templatePartIndex, - 1).join('/').concat('/', name);

  return {
    compiled: compiled,
    file: file, // Required by gutil.template().
    moduleName: moduleName,
    name: name,
    namespace: namespace
  };
}


/**
 * @param {Object} ctx Is the wrapper template's context.
 * @return {String} Returns a compiled Ember.Handlebars template text using an AMD-style module wrapper.
 */
function toAMD(ctx) {
  return gutil.template('define("<%= moduleName %>", function () { return Ember.TEMPLATES["<%= name %>"] = <%= compiled %> });', ctx);
}


/**
 * @param {Object} ctx Is the wrapper template's context.
 * @return {String} Returns a compiled Ember.Handlebars template text for use directly in the browser.
 */
function toBrowser(ctx) {
  return gutil.template('<%= namespace %>["<%= name %>"] = <%= compiled %>', ctx);
}


/**
 * @param {Object} ctx Is the wrapper template's context.
 * @return {String} Returns a compiled Ember.Handlebars template text using an CommonJS-style module wrapper.
 */
function toCommonJS(ctx) {
  return gutil.template('module.exports = Ember.TEMPLATES["<%= name %>"] = <%= compiled %>', ctx);
}


module.exports = function (options) {
  var outputType = options.outputType || 'browser', // amd, browser, cjs
      namespace = options.namespace || 'Ember.TEMPLATES',
      templateRoot = options.templateRoot || 'templates',
      processName = options.processName || defaultProcessName,
      compilerOptions = options.compilerOptions || {},
      compileHandlebars;

  compileHandlebars = function (file, callback) {
    var context;

    // Get the name of the template
    var name = processName(file.path);

    // Perform pre-compilation
    var compiled = compiler.precompile(file.contents.toString(), compilerOptions);

    // Surround the raw output as an Ember.Handlebars.template.
    compiled = 'Ember.Handlebars.template('.concat(compiled, ');');

    // Build the template context.
    context = ctx(file, templateRoot, name, compiled, namespace);

    switch (outputType) {
    case 'amd':
      compiled = toAMD(context);
      break;
    case 'browser':
      compiled = toBrowser(context);
      break;
    case 'cjs':
      compiled = toCommonJS(context);
      break;
    default:
      callback(new Error('Invalid output type: ' + outputType));
    }

    file.path = path.join(path.dirname(file.path), name+'.js');
    file.contents = new Buffer(compiled);

    callback(null, file);
  };

  return es.map(compileHandlebars);
};
