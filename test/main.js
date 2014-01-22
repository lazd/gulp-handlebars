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

var fileMatchesExpected = function(file, fixtureFilename) {
  path.basename(file.path).should.equal('Basic.js');  
  String(file.contents).should.equal(getExpectedString(fixtureFilename));
};

describe('gulp-handlebars', function() {
  describe('handlebarsPlugin()', function() {

    it('should throw on invalid input type', function() {
      (function() {
        handlebarsPlugin({
          outputType: 'cow'
        });
      }).should.throw();
    });

    it('should compile unwrapped bare templates', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'bare',
        wrapped: false
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
        wrapped: true
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

    it('should compile templates for AMD', function(done) {
      var stream = handlebarsPlugin({
        outputType: 'amd',
        wrapped: true
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
        wrapped: true
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
        wrapped: true
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

  });
});
