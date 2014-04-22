/**
 * buildFunctionString:
 * Given the body of a function as a string and a javascript object which 
 * represents the parameters to be passed into the function, this method
 * appends the function body with a "params" variable that will hold the 
 * params javascript object when the function is run within a VM.
 ***/
var buildFunctionString = function(functionBody, params){
	return "var params = " + JSON.stringify(params) + "; " + functionBody;
}

/**
 * runFunction:
 * Given the body of a function as a string, runs the function within a node.js
 * sandboxed virtual machine and returns the result.
 * - result is a PROMISE of the form {result, done}
 * - result.result is null by default unless changed by the child process
 * - result.done is boolean, false first and true when child process is done
 * - timeout is optional (defaults to 1000ms) to kill process after a while
 ***/
var cp = require("child_process");
var runFunction = function(functionBody, timeout){
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

module.exports = {
	runFunction: runFunction,
	buildFunctionString: buildFunctionString
}