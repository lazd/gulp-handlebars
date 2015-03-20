var through2 = require('through2');
var gutil = require('gulp-util');

const PLUGIN_NAME = 'gulp-handlebars';

module.exports = function(opts) {
  'use strict';

  opts = opts || {};
  var compilerOptions = opts.compilerOptions || false;
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
    var defaultCompiler = function(contents, options) {
      var ast = handlebars.parse(contents);
      // Preprocess AST before compiling
      if (opts.processAST) {
        // processAST may return new AST or change it in place
        ast = opts.processAST(ast) || ast;
      }
      return handlebars.precompile(ast, options).toString();
    };

    // if HTMLBars, opts.compiler is expected to be passed in
    var isHTMLBars =  (typeof opts.compiler === 'function');
    // defaultCompiler used to render any handlebars templates
    // `opts.compiler` allows third party to override the internal compiler
    var compiler = isHTMLBars ? opts.compiler : defaultCompiler;
    try {
      compiled = compiler(contents, compilerOptions);
    }
    catch (err) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, err, {
        fileName: file.path
      }));
      return callback();
    }

    // If HTMLBars, output would be prefixed with Ember.HTMLBars.template function
    compiled = isHTMLBars ? 'export default Ember.HTMLBars.template(' + compiled + ');' : compiled;

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
