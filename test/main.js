var handlebarsPlugin = require('../');
var should = require('should');
var gutil = require('gulp-util');
var os = require('os');
var fs = require('fs');
var path = require('path');
require('mocha');

var getFixture = function(filePath) {
  filePath = path.join('test', 'fixtures', filePath);
  return new gutil.File({
    path: filePath,
    cwd: path.join('test', 'fixtures'),
    base: path.dirname(filePath),
    contents: fs.readFileSync(filePath)
  });
};

var getExpectedString = function(filePath) {
  return fs.readFileSync(path.join('test', 'expected', filePath), 'utf8');
};

var fileMatchesExpected = function(file, expectedFileName) {
    String(file.contents).should.equal(getExpectedString(expectedFileName));
};

describe('gulp-handlebars', function() {
  describe('handlebarsPlugin()', function() {

    it('should declare namespaces', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'browser',
        namespace: 'MyApp.Templates',
        declareNamespace: true
      });

      var appTemplate = new gutil.File({
        base: 'fixtures',
        path: path.join('fixtures','App.Main.hbs'),
        contents: new Buffer('<div class="app"></div>')
      });

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        var contents = String(newFile.contents);
        contents.slice(0, 98).should.equal('this["MyApp"] = this["MyApp"] || {};this["MyApp"]["Templates"] = this["MyApp"]["Templates"] || {};');
        done();
      });
      stream.write(appTemplate);
      stream.end();
    });

    it('should declare the namespace for templates', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'browser',
        namespace: 'MyApp.Templates',
        declareNamespace: true
      });

      var appTemplate = new gutil.File({
        base: 'fixtures',
        path: path.join('fixtures','App.Main.hbs'),
        contents: new Buffer('<div class="app"></div>')
      });

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        var contents = String(newFile.contents);
        contents.slice(0,174).should.equal('this["MyApp"] = this["MyApp"] || {};this["MyApp"]["Templates"] = this["MyApp"]["Templates"] || {};this["MyApp"]["Templates"]["App"] = this["MyApp"]["Templates"]["App"] || {};');
        done();
      });
      stream.write(appTemplate);
      stream.end();
    });

    it('should compile unwrapped bare templates', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'bare',
        wrapped: false,
        namespace: false
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_bare_unwrapped.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

    it('should compile wrapped bare templates', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'bare',
        wrapped: true,
        namespace: false
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_bare.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

    it('should compile templates for the browser', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'browser',
        namespace: false
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_browser.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

    it('should compile templates for AMD', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'amd',
        namespace: false
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_amd.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

    it('should compile templates for CommonJS', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'commonjs',
        namespace: false
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_commonjs.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

    it('should compile templates for Node', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'node',
        namespace: false
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_node.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

    it('should compile hybrid Node/browser templates', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'hybrid',
        namespace: false
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_hybrid.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

    it('should support custom processName functions', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'browser',
        namespace: false,
        processName: function(name) {
          return 'x';
        }
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        newFile.path.should.equal('test/fixtures/x.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

  });
});
