var through2 = require('through2');
var PluginError = require('plugin-error');
const path = require('path');
const replaceExt = require('replace-ext');

const PLUGIN_NAME = 'gulp-handlebars';

module.exports = function(opts) {
  'use strict';

  opts = opts || {};
  var compilerOptions = opts.compilerOptions || {};
  var handlebars = opts.handlebars || require('handlebars');

  return through2.obj(function(file, enc, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return callback();
    }

    var contents = file.contents.toString();
    var compiled = null;
    var defaultCompiler = function(contents, options) {
      var ast = handlebars.parse(contents);
      // Preprocess AST before compiling
      if (opts.processAST) {
        // processAST may return new AST or change it in place
        ast = opts.processAST(ast) || ast;
      }
      return handlebars.precompile(ast, options).toString();
    };
    // defaultCompiler used to render any handlebars templates
    // `opts.compiler` allows third party to override the internal compiler
    var compiler = (typeof opts.compiler === 'function') ? opts.compiler : defaultCompiler;
    try {
      compiled = compiler(contents, compilerOptions);
    }
    catch (err) {
      this.emit('error', new PluginError(PLUGIN_NAME, err, {
        fileName: file.path
      }));
      return callback();
    }

    file.contents = new Buffer(compiled);
    file.path = replaceExt(file.path, '.js');

    // Options that take effect when used with gulp-define-module
    file.defineModuleOptions = {
      require: {
        Handlebars: 'handlebars'
      },
      context: {
        handlebars: 'Handlebars.template(<%= contents %>)'
      },
      wrapper: '<%= handlebars %>'
    };

    callback(null, file);
  });
};
