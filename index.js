var es = require('event-stream');
var Handlebars = require('handlebars');
var path = require('path');
var gutil = require('gulp-util');

// Return a declaration and namespace name for output
var getNSDeclaration = function(ns) {
  var output = [];
  var curPath = 'this';
  if (ns !== 'this') {
    var nsParts = ns.split('.');
    nsParts.forEach(function(curPart, index) {
      if (curPart !== 'this') {
        curPath += '[' + JSON.stringify(curPart) + ']';
        output.push(curPath + ' = ' + curPath + ' || {};');
      }
    });
  }

  return {
    namespace: curPath,
    declaration: output.join('\n')
  };
};

// Default name processing function should give the filename without extension
var defaultProcessName = function(name) { return path.basename(name, path.extname(name)); };

module.exports = function(options) {
  if (!options.fileName) throw new Error('Missing fileName option for gulp-handlebars');

  var compilerOptions = options.compilerOptions || {};
  var processName = options.processName || defaultProcessName;
  var ns = options.namespace || 'templates';

  var nsInfo = getNSDeclaration(ns);

  var buffer = [];

  var compileHandlebars = function(file, callback) {
    // Clone the file object
    var newFile = new gutil.File(file);

    // Get the name of the template
    var name = processName(file.path);

    // Perform pre-compilation
    var compiled = Handlebars.precompile(String(newFile.contents), compilerOptions);
    compiled = nsInfo.namespace+'['+JSON.stringify(name)+'] = '+compiled+';';

    newFile.contents = new Buffer(compiled);

    buffer.push(newFile);
  };

  var endStream = function() {
    if (buffer.length === 0) return this.emit('end');

    // Include declaration
    var fileContents = nsInfo.declaration+'\r\n';

    // Include each of the templates
    fileContents += buffer.map(function(file){
      return file.contents;
    }).join('\r\n');

    var joinedPath = path.join(buffer[0].base, options.fileName);

    var joinedFile = new gutil.File({
      cwd: buffer[0].cwd,
      base: buffer[0].base,
      path: joinedPath,
      contents: fileContents
    });

    this.emit('data', joinedFile);
    this.emit('end');
  };

  return es.through(compileHandlebars, endStream);
};
