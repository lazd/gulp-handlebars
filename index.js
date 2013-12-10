var es = require('event-stream');
var Handlebars = require('handlebars');
var path = require('path');
var os = require('os');
var gutil = require('gulp-util');

// TODO: Replace with gutil.linefeed once merged
var newline = os.EOL || (process.platform === 'win32' ? '\r\n' : '\n');

// TODO: Replace with gutil.extend once merged
var extend = function() {
  var i;
  var prop;
  var dest = arguments[0];
  for (i = 1; i < arguments.length; i++) {
    for (prop in arguments[i]) {
      dest[prop] = arguments[i][prop];
    }
  }
  return dest;
};

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
    declaration: output.join(newline)
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

  var buffer = [];

  var compileHandlebars = function(file, callback) {
    // Clone the file object
    var newFile = new gutil.File(file);

    // Get the name of the template
    var name = options.processName(file.path);

    // Perform pre-compilation
    try {
      var compiled = Handlebars.precompile(newFile.contents.toString(), options.compilerOptions);
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
        compiled += newline+"var Handlebars = g.Handlebars || require('handlebars');";

        if (options.declareNamespace) {
          compiled += nameNSInfo.declaration+newline+compiled;
        }

        compiled += newline+"var template = "+templateDef+";"
        compiled += newline+"if (typeof exports === 'object' && exports) module.exports = template;";
        compiled += newline+nameNSInfo.namespace+' = template;';
        compiled += newline+"}(typeof window !== 'undefined' ? window : global));";
      }
      else {
        // Add assignment
        compiled = nameNSInfo.namespace+' = '+compiled+';';

        if (options.declareNamespace) {
          // Tack on namespace declaration, if necessary
          compiled = nameNSInfo.declaration+newline+compiled;
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
      compiled = "var Handlebars = global.Handlebars || require('handlebars');"+newline+compiled;
    }
    else if (options.outputType !== 'bare') {
      callback(new Error('Invalid output type: '+options.outputType), file);
    }

    newFile.path = path.join(path.dirname(newFile.path), name+'.js');
    newFile.shortened = newFile.shortened && ext(newFile.shortened, '.js');
    newFile.contents = new Buffer(compiled);

    callback(null, newFile);
  };

  return es.map(compileHandlebars);
};
