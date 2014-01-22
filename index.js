var es = require('event-stream');
var Handlebars = require('handlebars');
var path = require('path');
var extend = require('xtend');

module.exports = function(options) {
  options = extend({
    compilerOptions: {},
    wrapped: false,
    outputType: 'bare' // amd, commonjs, node, bare
  }, options);

  var compileHandlebars = function(file, callback) {
    // Get the name of the template
    var name = file.path;
    name = path.basename(name, path.extname(name));

    // Perform pre-compilation
    try {
      var compiled = Handlebars.precompile(file.contents.toString(), options.compilerOptions);
    }
    catch(err) {
      return callback(err, file);
    }

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
      compiled = "var Handlebars = global.Handlebars || require('handlebars');"+compiled;
    }
    else if (options.outputType !== 'bare') {
      callback(new Error('Invalid output type: '+options.outputType), file);
    }

    file.path = path.join(path.dirname(file.path), name+'.js');
    file.contents = new Buffer(compiled);

    callback(null, file);
  };

  return es.map(compileHandlebars);
};
