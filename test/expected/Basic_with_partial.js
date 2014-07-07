define(['handlebars','./_basic_partial'], function(Handlebars,_ea1f7485d5b8611651421a82fc9840ce) { return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, self=this;


  buffer += "Basic template - ";
  stack1 = self.invokePartial(partials._ea1f7485d5b8611651421a82fc9840ce, '_ea1f7485d5b8611651421a82fc9840ce', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  }); });