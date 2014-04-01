//======//
// TYPE //
//======//
// makeType is a function that takes two parameters:
// 1. name [String] - should be unique
// 2. randomize [Function] - return random value for this type (can take params)
// ---
// initialize new types like so:
// var T = makeType("T", randFunc);
// var t = new T(param1, param2, ...);
// ---
// get/set values like so:
// var oldval = t.val();
// t.val("newval");
// ---
// get type's name like so:
// var name = t.name();
var makeType = function(name, randomize){
	var Type = function(){
		this.name = name;
		this.value = randomize.apply(this, arguments);
	}
	Type.prototype.val = function(val){
		if(val !== undefined){
			this.value = val;
		} else {
			return this.value;
		}
	}
	Type.prototype.name = function(){
		return this.name;
	}
	return Type;
}

//=================//
// TYPE DICTIONARY //
//=================//

// helper methods

// returns a random string
var randomString = function(length){
	length = parseInt(length);
	var chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
	var result = "";
	for(var i = 0; i < length; i++){
		result += chars.charAt(Math.round(Math.random() * chars.length));
	}
	return result;
}

// given a string of a function's body, run it in a VM
// returns a promise {result, done}:
//   - result will be null at first before done is true, or if function fails
//   - done will be false at first, and true when the function returns or fails
// optionally pass timeout (in milliseconds) to force function to fail
// timeout defaults to 1000 millisecodns
var cp = require("child_process");
var runFunctionString = function(functionBody, timeout){
	if(timeout === undefined) timeout = 1000;
	var child = cp.fork("./sandboxfunc.js", [functionBody]);
	var result = {result: null, done: false};

	//==== THIS SECTION HAPPENS AFTER RETURN ====//
	var timeoutId = setTimeout(function(){
		// kill child after this amount of time
		child.kill();
		result.done = true;
	}, timeout);

	child.on("message", function(data){
		result.result = data;
		result.done = true;
		child.kill();
		clearTimeout(timeoutId);
	});
	//===========================================//

	return result;
}

// dictionary

var types = {
	// Bool
	// returns true or false randomly
	Bool: makeType("Bool", function(){
		var index = Math.round(Math.random());
		return [true, false][index];
	}),
	// Integer
	// returns positive integer within range [0 - range]
	Integer: makeType("Integer", function(range){
		range = parseInt(range);
		return Math.round(Math.random() * range);
	}),
	// Float
	// returns positive float within range [0 - range]
	Float: makeType("Float", function(range){
		range = parseInt(parse);
		return (Math.random * range);
	}),
	// CharString
	// returns a random string of specified length
	CharString: makeType("String", randomString),
	// FirstName
	// returns random first name
	FirstName: makeType("FirstName", function(gender){
		var boys = ["Jacob", "Mason", "Ethan", "Noah", "William", "Michael",
					"Alexander", "Aiden", "Daniel", "Matthew", "James", "David",
					"Logan", "Jackson", "Ryan", "Christopher", "Dylan", "Adam",
					"Parker", "Evan", "Nathan", "Hunter", "Kevin", "John"];
		var girls = ["Sophie", "Emma", "Olivia", "Ava", "Emily", "Mia", "Ella",
					"Chloe", "Avery", "Allison", "Anna", "Elizabeth", "Lauren",
					"Eva", "Ellie", "Andrea", "Lori", "Lucy", "Leah", "Lyla",
					"Zoe", "Molly", "Holly", "Lydia", "Marie", "Jessica"];
		if(gender === "M" || gender === "m"){
			return boys[Math.round(Math.random() * (boys.length-1))];
		} else if(gender === "F" || gender === "f"){
			return girls[Math.round(Math.random() * (girls.length-1))];
		} else {
			var all = boys.concat(girls);
			return all[Math.round(Math.random() * (all.length-1))];
		}
	}),
	// LastName
	// returns random last name
	LastName: makeType("LastName", function(){
		var names = ["Smith", "Brown", "Lee", "Wilson", "Martin", "Patel",
					 "Taylor", "Campbell", "Williams", "Thompson", "Jones",
					 "Miller", "Davis", "Garcia", "Rodriguez", "Anderson",
					 "White", "Lewis", "Walker", "Allen", "Baker", "Adams",
					 "Roberts", "Murphy", "Bailey", "Cox", "Gray", "James", 
					 "Foster", "Jenkins", "Cruz", "Fisher", "Sanders", "Price",
					 "Myers", "Reyes", "Ross", "Butler", "Powell", "Wood"];
		return names[Math.round(Math.random() * (names.length-1))];
	}),
	// PhoneNumber
	// returns randomzied phone number
	PhoneNumber: makeType("PhoneNumber", function(){
		var digits = "0123456789";
		var number = "(";
		for(var i = 0; i < 3; i++){
			number += digits.charAt(Math.round(Math.random() * 9));
		}
		number += ")";
		for(var i = 0; i < 3; i++){
			number += digits.charAt(Math.round(Math.random() * 9));
		}
		number += "-";
		for(var i = 0; i < 4; i++){
			number += digits.charAt(Math.round(Math.random() * 9));
		}
		return number;
	}),
	// Email - pass in (optional) firstname and (optional) lastname
	// returns a randomized email address based on firstname and lastname
	// if no arguments supplied, randomized strings for names
	Email: makeType("Email", function(firstname, lastname){
		var email = "";
		var first = (firstname) ? firstname.toLocaleLowerCase() : randomString(6);
		var last = (lastname) ? lastname.toLocaleLowerCase() : randomString(6);
		email += first;
		email += "._".charAt(Math.round(Math.random()));
		email += last;
		var digits = "0123456789";
		var append = [1, 2, 3][Math.round(Math.random() * 2)]
		for(var i = 0; i < append; i++){
			email += digits.charAt(Math.round(Math.random() * 9));
		}
		email += "@";
		var providers = ["gmail", "hotmail", "aol", "yahoo"];
		email += providers[Math.round(Math.random() * (providers.length-1))];
		email += ".com";
		return email;
	}),
	// Custom - pass in string of function body and (optional) callback
	// runs function body in a VM and returns result of function
	// if callback supplied, callback gets called with result
	// if no callback supplied, results a promise object {result, done}
	// function body timesout in 1000 milliseconds
	// on timeout or function failure, result will be null
	Custom: makeType("Custom", function(customFuncBody, callback){
		if(!callback){
			return runFunctionString(customFuncBody, 1000);
		} else {
			var promise = runFunctionString(customFuncBody, 1000);
			var interval = setInterval(function(){
				if(promise.done){
					callback(promise.result);
					clearInterval(interval);
				}
			})
		}
	})
}

// args - array of string arguments for jsorandom
// for multiple arguments per field, separate by "{{}}"
// e.g. ["FieldName{{}}Email{{}}Jon{{}}Doe", "PhoneNumber"]
// should always be ["FieldName{{}}Type{{}}Arg1{{}}Arg2"]
// returns randomized json based on arguments
var makeRandomJson = function(args){
	var json = {};
	for(var i = 0; i < args.length; i++){
		var subArgs = args[i].split("{{}}");
		var field = subArgs[0];
		var type = subArgs[1];
		if(!(type in types)){
			json[field] = null;
		} else {
			var typeArgs = [];
			for(var j = 2; j < subArgs.length; j++){
				typeArgs[j-2] = subArgs[j];
			}
			var constructor = types[type];
			var Temp = function(){
				return constructor.apply(this, typeArgs);
			}
			Temp.prototype = constructor.prototype;
			json[field] = (new Temp()).val();
		}
	}
	return json;
}

//=========//
// EXPORTS //
//=========//

module.exports = {
	makeRandomJson: makeRandomJson
}

