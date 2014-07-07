define(['handlebars','./_basic_nested_partial'], function(Handlebars,_e390b316994ff22619f015b3cce7b2fa) { return Handlebars.registerPartial("_94e8ceec2cb635d72df145bf24fea501", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, self=this;


  buffer += "basic partial with nested ";
  stack1 = self.invokePartial(partials._e390b316994ff22619f015b3cce7b2fa, '_e390b316994ff22619f015b3cce7b2fa', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  })); });