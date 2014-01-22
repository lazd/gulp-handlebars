var map = require('vinyl-map');
var es = require('event-stream');
var rename = require('gulp-rename');
var Handlebars = require('handlebars');
var extend = require('xtend');

var outputTypes = ['amd', 'commonjs', 'node', 'bare'];

module.exports = function(options) {
  options = extend({
    compilerOptions: {},
    wrapped: false,
    outputType: 'bare' // amd, commonjs, node, bare
  }, options);

  if (outputTypes.indexOf(options.outputType) === -1) {
    throw new Error('Invalid output type: '+options.outputType);
  }

  var compileHandlebars = function(contents, path) {
    // Perform pre-compilation
    // This will throw if errors are encountered
    var compiled = Handlebars.precompile(contents.toString(), options.compilerOptions);

    if (options.wrapped) {
      compiled = 'Handlebars.template('+compiled+')';
    }

    // Handle different output times
    if (options.outputType === 'amd') {
      compiled = "define(['handlebars'], function(Handlebars) {return "+compiled+";});";
    }
    else if (options.outputType === 'commonjs') {
      compiled = "module.exports = function(Handlebars) {return "+compiled+";};";
    }
    else if (options.outputType === 'node') {
      compiled = "module.exports = "+compiled+";";

      if (options.wrapped) {
        // Only require Handlebars if wrapped
        compiled = "var Handlebars = global.Handlebars || require('handlebars');"+compiled;
      }
    }

    return compiled;
  };

  var doRename = function(dir, base, ext) {
    // Change the extension to .js
    return base+'.js';
  };

  return es.pipeline(
    map(compileHandlebars),
    rename(doRename)
  );
};
