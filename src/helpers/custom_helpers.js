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

//var Handlebars = require('handlebars');
hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});
hbs.registerHelper("inc2", function (value, options) {
  return parseInt(value) + 2;
});

hbs.registerHelper("checked", function (currentValue) {
  return currentValue == "1" ? 'checked="checked"' : "";
});

hbs.registerHelper("invoiceno", function (value) {
  return "000"+value;
});

hbs.registerHelper("replace", function (find, replace, options) {
  var string = options.fn(this);
  return string.replace(find, replace);
});
hbs.registerHelper("if_eq", function (a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

hbs.registerHelper("distanceFixed", function (distance) {
  if(distance > 0){
    let split = distance.toString().split('.')[1];
    if(typeof split !== 'undefined' && split.length == 2){
      return distance;
    } else {
      return distance.toFixed(2);
    }
  } else {
    return distance;
  }
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

hbs.registerHelper("substract12", function (a, b) {
  if(a > 0 && b > 0){
    return (a - b).toFixed(2);
  } else {
    return parseInt(a);
  }
  
});
hbs.registerHelper("substract3", function (a, b, c) {
  return (a - b - c).toFixed(2);
});
hbs.registerHelper("sum", function (a, b) {
  return (a + b).toFixed(2);
});
hbs.registerHelper("sum3", function (a, b, c) {
  let finala = 0;let finalb = 0;let finalc = 0;
  if(a !== undefined && parseFloat(a) > 0){finala = a;}
  if(b !== undefined && parseFloat(b) > 0){finalb = b;}
  if(c !== undefined && parseFloat(c) > 0){finalc = c;}
  let final_calculation = (parseInt(finala) + parseInt(finalb) + parseInt(finalc)).toFixed(2);
  if(final_calculation > 0){
    return final_calculation;
  } else {
    return 0;
  }
});

hbs.registerHelper("valaddsub", function (a, b, c) {
  let finala = 0;let finalb = 0;let finalc = 0;
  if(a !== undefined && parseFloat(a) > 0){finala = a;}
  if(b !== undefined && parseFloat(b) > 0){finalb = b;}
  if(c !== undefined && parseFloat(c) > 0){finalc = c;}
  let final_calculation = (parseInt(finala) + parseInt(finalb) - parseInt(finalc)).toFixed(2);
  return parseFloat(final_calculation);
});

hbs.registerHelper("equalnumbers", function (arg1, arg2, options) {
  return parseFloat(arg1) == parseFloat(arg2) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper("gt0null", function(dateString, options) {
  if(dateString == "" || dateString == 0 || dateString == null || dateString.length == 0){
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

hbs.registerHelper('gt', function( a, b ){
	var next =  arguments[arguments.length-1];
	return (a > b) ? next.fn(this) : next.inverse(this);
});

hbs.registerHelper( "when",function(operand_1, operator, operand_2, options) {
  var operators = {
   'eq': function(l,r) { return l == r; },
   'noteq': function(l,r) { return l != r; },
   'gt': function(l,r) { return Number(l) > Number(r); },
   'or': function(l,r) { return l || r; },
   'and': function(l,r) { return l && r; },
   '%': function(l,r) { return (l % r) === 0; }
  }
  , result = operators[operator](operand_1,operand_2);

  if (result) return options.fn(this);
  else  return options.inverse(this);
});

hbs.registerHelper("has_passed", function(dateString, options) {
  if(dateString == ""){
      //return options.fn(this);
  } else {
    if(moment(dateString).isAfter(moment())){
      return options.fn(this);
    } else {
      return options.inverse(this);
      }
  }
  
});

hbs.registerHelper("encodeMyString", function (inputData) {
  return new hbs.SafeString(inputData);
});

hbs.registerHelper("trimString", function (passedString) {
  var theString = passedString.substring(0, 35) + "...";
  return new hbs.SafeString(theString);
});

hbs.registerHelper("select", function (selected, options) {
  return options
    .fn(this)
    .replace(new RegExp(' value="' + selected + '"'), '$& selected="selected"');
});

hbs.registerHelper("selectHelper", function (selected, options) {
  var html = options.fn(this);
  if (selected) {
    var values = selected.split(",");
    var length = values.length;

    for (var i = 0; i < length; i++) {
      html = html.replace(
        new RegExp(' value="' + values[i] + '"'),
        '$& selected="selected"'
      );
    }
  }
  return html;
});

hbs.registerHelper("sum", function (a, b) {
  return parseFloat(a) + parseFloat(b);
});

hbs.registerHelper("anyoneof3", function (a, b ,c) {
  let final_a = parseFloat(a) || 0;
  let final_b = parseFloat(b) || 0;
  let final_c = parseFloat(c) || 0;
  if(final_a > 0){
    add = final_a;
  } else if(final_b > 0){
    add = final_b;
  } else if(final_c > 0){
    add = final_c;
  }
  return parseFloat(add);
});

hbs.registerHelper("monthofdate", function (date) {
  const d = new Date(date);
  return (parseInt(d.getMonth())+1);
});

hbs.registerHelper('times', function(n, block) {
  var accum = '';
  for(var i = 0; i < n; ++i)
      accum += block.fn(i);
  return accum;
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

hbs.registerHelper('decrementFromEnd', function(index, arrayLength) {
  return arrayLength - index - 1;
});


hbs.registerHelper('removedotzero', function(string, search, replace) {
  return string.replace(".0", "");
});
hbs.registerHelper('removedotzerozero', function(string, search, replace) {
  return string.replace(".00", "");
});

hbs.registerHelper("multiplyfournos", function (a, b,c,d) {
  let finala = 0;let finalb = 0;let finalc = 0;finald = 0;
  if(a !== undefined && parseFloat(a) > 0){finala = a;}
  if(b !== undefined && parseFloat(b) > 0){finalb = b;}
  if(c !== undefined && parseFloat(c) > 0){finalc = c;}
  if(d !== undefined && parseFloat(d) > 0){finald = d;}
  let final_calculation = (parseInt(finala) + parseInt(finalb) - parseInt(finalc)) * (parseFloat(finald));
  return final_calculation;
});

hbs.registerHelper("multiplysumthreenos", function (a, b,c) {
  let finala = 0;let finalb = 0;let finalc = 0;
  if(a !== undefined && parseFloat(a) > 0){finala = a;}
  if(b !== undefined && parseFloat(b) > 0){finalb = b;}
  if(c !== undefined && parseFloat(c) > 0){finalc = c;}
  let final_calculation = (parseInt(finala) + (parseInt(finalb) * parseInt(finalc)));
  return final_calculation;
});

hbs.registerHelper("stockpurchasequantity", function (a, b,c,d,e,f) {
  let finala = 0;let finalb = 0;let finalc = 0;finald = 0;finale = 0;finalf = 0;
  if(a !== undefined && parseFloat(a) > 0){finala = a;}
  if(b !== undefined && parseFloat(b) > 0){finalb = b;}
  if(c !== undefined && parseFloat(c) > 0){finalc = c;}
  if(d !== undefined && parseFloat(d) > 0){finald = d;}
  if(e !== undefined && parseFloat(e) > 0){finale = e;}
  if(f !== undefined && parseFloat(f) > 0){finalf = f;}
  let final_calculation_abc = (parseInt(finala) + parseInt(finalb) - parseInt(finalc)).toFixed(2);
  let final_calculation_def = (parseInt(finald) + parseInt(finale) - parseInt(finalf)).toFixed(2);
  let final_calculation = parseFloat(final_calculation_abc)+parseFloat(final_calculation_def);
  return parseFloat(final_calculation);
});