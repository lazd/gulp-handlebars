var es = require('event-stream');
var Handlebars = require('handlebars');
var path = require('path');
var gutil = require('gulp-util');
var extend = require('xtend');

// Return a declaration and namespace name for output
var getNSInfo = function(ns, omitLast) {
  var output = [];
  var curPath = 'this';
  if (ns !== 'this') {
    var nsParts = ns.split('.');
    nsParts.some(function(curPart, index) {
      if (curPart !== 'this') {
        curPath += '[' + JSON.stringify(curPart) + ']';

        // Ignore the last part of the namespace, it will be used for assignment
        if (omitLast && index === nsParts.length - 1) {
          return true;
        }
        else {
          output.push(curPath + ' = ' + curPath + ' || {};');
        }
      }
    });
  }

  return {
    namespace: curPath,
    pathParts: output,
    declaration: output.join('')
  };
};

// Default name processing function should give the filename without extension
var defaultProcessName = function(name) { return path.basename(name, path.extname(name)); };

module.exports = function(options) {
  options = extend({
    compilerOptions: {},
    declareNamespace: true,
    wrapped: true,
    outputType: 'browser', // browser, amd, commonjs, node, hybrid, bare
    processName: defaultProcessName,
    namespace: 'templates'
  }, options);

  // Never declare namespaces if not provided
  if (!options.namespace) {
    options.declareNamespace = false;
  }

  var compileHandlebars = function(file, callback) {
    // Get the name of the template
    var name = options.processName(file.path);

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
    if (options.outputType === 'browser' || options.outputType === 'hybrid') {
      // Prepend namespace to name
      if (options.namespace !== false) {
        name = options.namespace+'.'+name;
      }

      // Get namespace information for the final template name
      var nameNSInfo = getNSInfo(name, true);

      if (options.outputType === 'hybrid') {
        var templateDef = compiled;

        compiled = "(function(g) {";
        compiled += "var Handlebars = g.Handlebars || require('handlebars');";

        if (options.declareNamespace) {
          compiled += nameNSInfo.declaration+compiled;
        }

        compiled += "var template = "+templateDef+";"
        compiled += "if (typeof exports === 'object' && exports) module.exports = template;";
        compiled += nameNSInfo.namespace+' = template;';
        compiled += "}(typeof window !== 'undefined' ? window : global));";
      }
      else {
        // Add assignment
        compiled = nameNSInfo.namespace+' = '+compiled+';';

        if (options.declareNamespace) {
          // Tack on namespace declaration, if necessary
          compiled = nameNSInfo.declaration+compiled;
        }
      }
    }
    else if (options.outputType === 'amd') {
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
