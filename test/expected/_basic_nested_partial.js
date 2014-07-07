define(['handlebars'], function(Handlebars) { return Handlebars.registerPartial("_basic_nested_partial", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "nested partial";
  })); });