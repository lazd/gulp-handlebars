define(['handlebars','./_basic_partial_with_nested'], function(Handlebars,_94e8ceec2cb635d72df145bf24fea501) { return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, self=this;


  buffer += "Basic template - ";
  stack1 = self.invokePartial(partials._94e8ceec2cb635d72df145bf24fea501, '_94e8ceec2cb635d72df145bf24fea501', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  }); });