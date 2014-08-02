define(['handlebars','./_basic_partial'], function(Handlebars,_basic_partial) { return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, self=this;


  buffer += "Basic template - ";
  stack1 = self.invokePartial(partials._basic_partial, '_basic_partial', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  }); });