var a = parseInt(params["num1"]);
var b = parseInt(params["num2"]);
var op = params["op"]

if(op === "add"){
	return {result: a + b};
}
if(op === "sub"){
	return {result: a - b};
}
if(op === "mul"){
	return {result: a * b};
}
if(op === "div"){
	return {result: a / b};
}

return {result: "invalid operator"};