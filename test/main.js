'use strict';

var plugin = require('../');
var should = require('should');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
require('mocha');

var getFixture = function (filePath) {
  filePath = path.join('test', 'fixtures', filePath);
  return new gutil.File({
    path: filePath,
    cwd: path.join('test', 'fixtures'),
    base: path.dirname(filePath),
    contents: fs.readFileSync(filePath)
  });
};

var getExpectedString = function (filePath) {
  return fs.readFileSync(path.join('test', 'expected', filePath), 'utf8');
};

var fileMatchesExpected = function (file, expectedFileName) {
  String(file.contents).should.equal(getExpectedString(expectedFileName));
};

describe('gulp-ember-handlebars', function () {
  describe('plugin()', function () {

    it('should compile templates for the browser', function (done) {
      var stream = plugin({
        namespace: 'NAMESPACE',
        outputType: 'browser',
        templateRoot: 'fixtures'
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function (newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_browser.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

    it('should compile templates for AMD', function (done) {
      var stream = plugin({
        outputType: 'amd',
        templateRoot: 'fixtures'
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function (newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_amd.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

    it('should compile templates for CommonJS', function (done) {
      var stream = plugin({
        outputType: 'cjs',
        templateRoot: 'fixtures'
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function (newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_commonjs.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

    it('should support custom processName functions', function (done) {
      var stream = plugin({
        outputType: 'browser',
        namespace: 'NAMESPACE',
        processName: function (name) {
          return 'x';
        }
      });

      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function (newFile) {
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
