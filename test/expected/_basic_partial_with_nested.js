define(['handlebars','./_basic_nested_partial'], function(Handlebars,_basic_nested_partial) { return (function() { var __cTemplate = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, self=this;


  buffer += "basic partial with nested ";
  stack1 = self.invokePartial(partials._basic_nested_partial, '_basic_nested_partial', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  }); Handlebars.registerPartial("_basic_partial_with_nested", __cTemplate); return __cTemplate; })(); });