var through2 = require('through2');
var gutil = require('gulp-util');

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
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return callback();
    }

    var contents = file.contents.toString();
    var compiled = null;
    try {
      if (typeof handlebars.parse === 'function') {
        var ast = handlebars.parse(contents);

        if (opts.processAST) {
          // Preprocess AST before compiling
          // processAST may return new AST or change it in place
          ast = opts.processAST(ast) || ast;
        }

        compiled = handlebars.precompile(ast, compilerOptions).toString();
      }
      else {
        if (opts.processAST) {
          this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Cannot process AST; provided Handlebars library does not support parse() method'));
          return callback();
        }
        // Old versions of Handlebars do not have a parse method, and precompile returns a string
        compiled = handlebars.precompile(contents, compilerOptions);

        if (typeof compiled === 'function') {
          compiled = compiled.toString();
        }
        else {
          this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Handlebars.precompile() returned an AST object, but does not support Handlebars.parse(); cannot build output'));
          return callback();
        }
      }
    }
    catch (err) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, err, {
        fileName: file.path
      }));
      return callback();
    }

    file.contents = new Buffer(compiled);
    file.path = gutil.replaceExtension(file.path, '.js');

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
