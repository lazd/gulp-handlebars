var handlebarsPlugin = require('../');
var defineModule = require('gulp-define-module');
var should = require('should');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
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

var fileMatchesExpected = function(file, fixtureFilename, expectedFilename) {
  path.basename(file.path).should.equal(expectedFilename);
  String(file.contents).should.equal(getExpectedString(fixtureFilename));
};

describe('gulp-handlebars', function() {
  describe('handlebarsPlugin()', function() {

    it('should emit an error when compiling invalid templates', function(done) {
      var stream = handlebarsPlugin();
      var invalidTemplate = getFixture('Invalid.hbs');

      stream.on('error', function(err) {
        err.should.be.an.instanceOf(Error);
        err.message.should.equal(getExpectedString('Error.txt'));
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
        fileMatchesExpected(newFile, 'Basic.js', 'Basic.js');
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
        fileMatchesExpected(newFile, 'Basic.js', 'Basic.js');

        count++;
        if (count === 2) {
          done();
        }
      });
      stream.write(basicTemplate);
      stream.write(basicTemplate2);
      stream.end();
    });

    it('should pass require and wrapper options to gulp-define-module', function(done) {
      var hbsStream = handlebarsPlugin();
      var defineStream = hbsStream.pipe(defineModule('node'));
      var basicTemplate = getFixture('Basic.hbs');

      hbsStream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_node.js', 'Basic.js');
        done();
      });
      hbsStream.write(basicTemplate);
      hbsStream.end();
    });

    it('should give filename without extension to gulp-define-module', function(done) {
      var hbsStream = handlebarsPlugin();
      var defineStream = hbsStream.pipe(defineModule('plain', {
        // Assumes MyApp.Templates is already declared
        wrapper: 'MyApp.templates["<%= name %>"] = <%= handlebars %>'
      }));
      var basicTemplate = getFixture('Basic.hbs');

      hbsStream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        fileMatchesExpected(newFile, 'Basic_namespace.js', 'Basic.js');
        done();
      });
      hbsStream.write(basicTemplate);
      hbsStream.end();
    });

    it('should compile template and register nested partial', function(done) {
      var hbsStream = handlebarsPlugin({ parsePartials: true });
      var basicTemplate = getFixture('Basic_with_partial.hbs');
      hbsStream.pipe(defineModule('amd'));

      hbsStream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        should.exist(newFile.partialsRegistry);
        should.equal(_(newFile.partialsRegistry).values().first(), '_ea1f7485d5b8611651421a82fc9840ce');
        fileMatchesExpected(newFile, 'Basic_with_partial.js', 'Basic_with_partial.js');
        done();
      });
      hbsStream.write(basicTemplate);
      hbsStream.end();
    });

    it('should compile template, partial and register nested partial', function(done) {
      var hbsStream = handlebarsPlugin({ parsePartials: true });
      var basicTemplate = getFixture('Basic_with_partial.hbs');
      var basicPartial = getFixture('_basic_partial.hbs');
      hbsStream.pipe(defineModule('amd'));

      hbsStream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        should.exist(newFile.partialsRegistry);
        should.equal(_(newFile.partialsRegistry).values().first(), '_ea1f7485d5b8611651421a82fc9840ce');

        switch (path.basename(newFile.path)) {
          case 'Basic_with_partial.js':
            fileMatchesExpected(newFile, 'Basic_with_partial.js', 'Basic_with_partial.js');
            break;
          case '_basic_partial.js':
            fileMatchesExpected(newFile, '_basic_partial.js', '_basic_partial.js');
            done();
            break;
        }
      });
      hbsStream.write(basicTemplate);
      hbsStream.write(basicPartial);
      hbsStream.end();
    });

    it('should compile template, partial and register nested partials', function(done) {
      var hbsStream = handlebarsPlugin({ parsePartials: true });
      var basicTemplateWithNestedPartial = getFixture('Basic_with_nested_partial.hbs');
      var basicPartialWithNestedPartial = getFixture('_basic_partial_with_nested.hbs');
      var basicNestedPartial = getFixture('_basic_nested_partial.hbs');
      hbsStream.pipe(defineModule('amd'));

      hbsStream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        should.exist(newFile.partialsRegistry);

        switch (path.basename(newFile.path)) {
          case 'Basic_with_nested_partial.js':
            fileMatchesExpected(newFile, 'Basic_with_nested_partial.js', 'Basic_with_nested_partial.js');
            // first nested partial found and registered
            should.deepEqual(_(newFile.partialsRegistry).values().value(), ['_94e8ceec2cb635d72df145bf24fea501']);
            break;
          case '_basic_partial_with_nested.js':
            fileMatchesExpected(newFile, '_basic_partial_with_nested.js', '_basic_partial_with_nested.js');
            // two nested partials found and registered
            should.deepEqual(_(newFile.partialsRegistry).values().value(), ['_94e8ceec2cb635d72df145bf24fea501', '_e390b316994ff22619f015b3cce7b2fa']);
            break;
          case '_basic_nested_partial.js':
            fileMatchesExpected(newFile, '_basic_nested_partial.js', '_basic_nested_partial.js');
            // two nested partials found and registered and do not have redundant items
            should.deepEqual(_(newFile.partialsRegistry).values().value(), ['_94e8ceec2cb635d72df145bf24fea501', '_e390b316994ff22619f015b3cce7b2fa']);

            done();
            break;
        }
      });
      hbsStream.write(basicTemplateWithNestedPartial);
      hbsStream.write(basicPartialWithNestedPartial);
      hbsStream.write(basicNestedPartial);
      hbsStream.end();
    });
  });
});
