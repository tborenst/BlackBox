// sandboxfunc.js
// mini-node.js routine (pass in function body as argument)
// send result of function to parent process

var vm = require("vm");

var sandbox = {result: null, http: require("http")};
var functionBody = process.argv[2];
var wholeString = "result = (function(){" + functionBody + "})();";

try {
	vm.runInNewContext(wholeString, sandbox);
	process.send(sandbox.result);
} catch (e){
	console.log(e);
	process.send({error: 'Could not run Box.'});
}