// sandboxfunc.js
// mini-nodejs routine (pass in function body as argument)
// send result of function to parent process

var vm = require("vm");

var sandbox = {result: null};
var functionBody = process.argv[2];
var wholeString = "result = (function(){" + functionBody + "})();";

try {
	vm.runInNewContext(wholeString, sandbox);
	process.send(sandbox.result);
} catch (e){
	process.send(null);
}