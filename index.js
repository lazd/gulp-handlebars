'use strict';

var es = require('event-stream'),
    path = require('path'),
    compiler = require('ember-template-compiler');


// Default name function returns the filename without extension given the a file path string.
var defaultProcessName = function (name) { return path.basename(name, path.extname(name)); };


/**
 * @param {File} filePath Is the gulp.File instance's path string.
 * @param {String} templateRoot Is the templates root directory name (i.e., "templates").
 * @param {String} name Is the template name without any extensions.
 * @returns {String} Returns the template module name used by the AMD wrapper.
 */
function buildModuleName(filePath, templateRoot, name) {
  var pathParts = filePath.split(path.sep),
      templatePartIndex = pathParts.lastIndexOf(templateRoot);
  return pathParts.slice(templatePartIndex, - 1).join('/').concat('/', name);
}


/**
 * @param {File} filePath Is the gulp.File instance's path string.
 * @param {String} templateRoot Is the templates directory name (i.e., "templates").
 * @param {String} name Is the template name without any extensions.
 * @param {String} compiled Is the pre-compiled Ember.Handlebars template text.
 *
 * @returns {String} Returns a compiled Ember.Handlebars template text using an AMD-style module wrapper.
 */
function toAMD(filePath, templateRoot, name, compiled) {
  var moduleName = buildModuleName(filePath, templateRoot, name);
  // 'define("<%= moduleName %>", function () { return Ember.TEMPLATES["<%= name %>"] = <%= compiled %> });'
  return 'define("'.concat(moduleName, '", function () { return Ember.TEMPLATES["', name, '"] = ', compiled, ' });');
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
      compileHandlebars;

  compileHandlebars = function (file, callback) {
    // Get the name of the template
    var name = processName(file.path);

    // Perform pre-compilation
    var compiled = compiler.precompile(file.contents.toString(), compilerOptions);

    // Surround the raw output as an Ember.Handlebars.template.
    compiled = 'Ember.Handlebars.template('.concat(compiled, ');');

    switch (outputType) {
    case 'amd':
      compiled = toAMD(file.path, templateRoot, name, compiled);
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

    file.path = path.join(path.dirname(file.path), name + '.js');
    file.contents = new Buffer(compiled);

    callback(null, file);
  };

  return es.map(compileHandlebars);
};
