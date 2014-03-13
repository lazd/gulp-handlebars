var handlebarsPlugin = require('../');
var should = require('should');
var gutil = require('gulp-util');
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

    it('should emit an error when compiling invalid templates', function(done) {
      var stream = handlebarsPlugin();
      var invalidTemplate = getFixture('Invalid.hbs');

      stream.on('error', function(err) {
        err.should.be.an.instanceOf(Error);
        err.message.should.equal("Parse error on line 1:\n" +
          "...syntax error: {{foo }}}\n"+
          "-----------------------^\n" +
          "Expecting 'CLOSE', got 'CLOSE_UNESCAPED'");
        done();
      });

      stream.write(invalidTemplate);
      stream.end();
    });

    it('should compile templates', function(done) {
      var stream = handlebarsPlugin();
      var basicTemplate = getFixture('Basic.hbs');

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic.js');
        done();
      });
      stream.write(basicTemplate);
      stream.end();
    });

    it('should compile multiple templates', function(done) {
      var stream = handlebarsPlugin();
      var basicTemplate = getFixture('Basic.hbs');
      var basicTemplate2 = getFixture('Basic.hbs');

      var count = 0;
      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic.js');

        count++;
        if (count === 2) {
          done();
        }
      });
      stream.write(basicTemplate);
      stream.write(basicTemplate2);
      stream.end();
    });
  });
});
