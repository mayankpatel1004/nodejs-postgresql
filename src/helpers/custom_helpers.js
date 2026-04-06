const path = require("path");
const partialsPath = path.join(__dirname, "./templates/partials");
const hbs = require("hbs");
hbs.registerPartials(partialsPath);
const moment = require('moment');

hbs.registerHelper("equal", require("handlebars-helper-equal"));
hbs.registerHelper("check", function (value, comparator) {
  return value === comparator ? "" : value;
});
hbs.registerHelper("ifCond", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper("toUpperCase", function (str) {
  return str.toUpperCase();
});

hbs.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

hbs.registerHelper("checked", function (currentValue) {
  return currentValue == "1" ? 'checked="checked"' : "";
});

hbs.registerHelper("dateFormat", require("handlebars-dateformat"));
hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper("multiply", function (a, b) {
  return (a * b).toFixed(2);
});
hbs.registerHelper("divide", function (a, b) {
  return (a / b).toFixed(2);
});

hbs.registerHelper("substract", function (a, b) {
  const numA = isNaN(parseFloat(a)) ? 0 : parseFloat(a);
  const numB = isNaN(parseFloat(b)) ? 0 : parseFloat(b);
  
  return numA - numB;
});

hbs.registerHelper("sum", function (a, b) {
  return (a + b).toFixed(2);
});

hbs.registerHelper('gt', function( a, b ){
	var next =  arguments[arguments.length-1];
	return (a > b) ? next.fn(this) : next.inverse(this);
});

hbs.registerHelper("select", function (selected, options) {
  return options
    .fn(this)
    .replace(new RegExp(' value="' + selected + '"'), '$& selected="selected"');
});

hbs.registerHelper("sum", function (a, b) {
  return parseFloat(a) + parseFloat(b);
});

hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(parseFloat(v1) === parseFloat(v2)) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('incremented', function (index) {
  index++;
  return index;
});