'use strict';

var through = require('through');
var path = require('path');
var gutil = require('gulp-util');
var Handlebars = require('handlebars');
var _ = require('lodash');
var crypto = require('crypto');

var generateUniqueId = function(s) {
  return '_' + crypto.createHash('md5').update(s).digest('hex');
};

module.exports = function(options) {
  var opts = options || {};
  var compilerOptions = opts.compilerOptions || {};
  var partialsRegistry = {};
  var defineModuleOptions = opts.defineModuleOptions || {
    context: {
      handlebars: 'Handlebars.template(<%= contents %>)'
    }
  };
  var templateWrapper = opts.templateWrapper || '(function() { var __cTemplate = Handlebars.template(<%= contents %>); __cTemplate["default"] = __cTemplate; return __cTemplate; })()';
  var partialWrapper = opts.partialWrapper || '(function() { var __cTemplate = <%= templateWrapper %>; Handlebars.registerPartial("<%= partialName %>", __cTemplate); __cTemplate["default"] = __cTemplate; return __cTemplate; })()';

  return through(function(file) {
    if (file.isNull()) {
      return this.queue(file);
    }

    if (file.isStream()) {
      return this.emit('error', new gutil.PluginError('gulp-handlebars', 'Streaming not supported'));
    }

    var contents = file.contents.toString();
    var compiled = null;
    var partialId = null;
    var partialsDepsMap = {};
    var partialsPrefix = opts.partialsPrefix || '_';
    var isPartial = path.basename(file.relative)[0] === partialsPrefix;

    if (opts.parsePartials) {
      var parseNodes = function(nodes) {
        _.each(nodes, function(node) {
          if (_.isObject(node) || _.isArray(node)) {
            if (node.type === 'partial') {
              var partialName = node.partialName.name;
              // console.log(node.partialName.name);
              // extract the partial path relative to the target template
              var partialPath = path.join(path.resolve(path.dirname(file.relative), path.dirname(partialName)), path.basename(partialName));
              // extract the existing unique partial ID by path or generate the new one
              partialId = partialsRegistry[partialPath] || generateUniqueId(partialPath);
              // replace the partials occurrences to the unique partial ID
              contents = contents.replace(new RegExp('>[\\s]*' + partialName, 'g'), '> ' + partialId);
              // add partial to the dependencies map, make relative if simple name
              partialsDepsMap[partialId] = partialName.match(/\.+\/+/gi) ? partialName : './' + partialName;
              // store the partial path to id relation
              partialsRegistry[partialPath] = partialId;
            }

            parseNodes(node);
          }
        });
      };

      try {
        parseNodes(Handlebars.parse(contents));
      }
      catch (err) {
        return this.emit('error', err);
      }
    }

    // store the partial data into registry
    if (isPartial) {
      // extract the partial path
      var partialPath = path.join(path.resolve(path.dirname(file.relative)), path.basename(file.relative, '.hbs'));
      // extract the existing unique partial ID by path or generate the new one
      partialId = partialsRegistry[partialPath] || generateUniqueId(partialPath);
      // store the partial path to id relation
      partialsRegistry[partialPath] = partialId;
    }

    try {
      compiled = Handlebars.precompile(contents, compilerOptions).toString();
    }
    catch (err) {
      return this.emit('error', err);
    }

    file.contents = new Buffer(compiled);
    file.path = gutil.replaceExtension(file.path, '.js');

    file.defineModuleOptions = _.defaults({
      require: _.extend({ Handlebars: 'handlebars' }, defineModuleOptions.require, partialsDepsMap),
      context: _.extend({
        isPartial: isPartial,
        partialName: partialId,
        templateWrapper: templateWrapper
      }, defineModuleOptions.context),
      wrapper: isPartial ? partialWrapper : templateWrapper
    }, defineModuleOptions);

    file.partialsRegistry = partialsRegistry;

    this.queue(file);
  });
};
