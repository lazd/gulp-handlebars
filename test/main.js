var handlebarsPlugin = require('../');
var should = require('should');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
require('mocha');

var newline = process.platform === 'win32' ? '\r\n' : '\n';

describe('gulp-handlebars', function() {
  describe('handlebarsPlugin()', function() {

    it('should set correct fileName', function(done) {
      var a = 0;

      var animalTemplate = new gutil.File({
        base: 'fixtures/',
        path: 'fixtures/Animal.hbs',
        contents: new Buffer('<p>The {{animal}} goes {{sound}}</p>')
      });

      var stream = handlebarsPlugin({
        fileName: 'Templates.js'
      });
      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        newFile.path.should.equal('fixtures/Templates.js');
        newFile.relative.should.equal('Templates.js');
        ++a;
      });

      stream.once('end', function() {
        a.should.equal(1);
        done();
      });

      stream.write(animalTemplate);
      stream.end();
    });

    it('should concat two templates files into one JS file', function(done) {
      var stream = handlebarsPlugin({
        fileName: 'templates.js'
      });

      var appTemplate = new gutil.File({
        base: 'fixtures/',
        path: 'fixtures/App.hbs',
        contents: new Buffer('<div class="app"></div>')
      });

      var animalTemplate = new gutil.File({
        base: 'fixtures/',
        path: 'fixtures/Animal.hbs',
        contents: new Buffer('<p>The {{animal}} goes {{sound}}</p>')
      });

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        newFile.path.should.equal('fixtures/templates.js');
        newFile.relative.should.equal('templates.js');
        done();
      });
      stream.write(appTemplate);
      stream.write(animalTemplate);
      stream.end();
    });


    it('should declare the correct namespace for templates', function(done) {
      var stream = handlebarsPlugin({
        fileName: 'templates.js',
        namespace: 'MyApp.Templates'
      });

      var appTemplate = new gutil.File({
        base: 'fixtures/',
        path: 'fixtures/App.hbs',
        contents: new Buffer('<div class="app"></div>')
      });

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        var contents = String(newFile.contents).split(newline);
        contents[0].should.equal('this["MyApp"] = this["MyApp"] || {};');
        contents[1].should.equal('this["MyApp"]["Templates"] = this["MyApp"]["Templates"] || {};');
        done();
      });
      stream.write(appTemplate);
      stream.end();
    });

  });
});
