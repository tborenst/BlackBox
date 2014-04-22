var a = parseInt(params["num1"]);
var b = parseInt(params["num2"]);
var op = params["op"]

if(op === "add"){
	return a + b;
}
if(op === "sub"){
	return a - b;
}
if(op === "mul"){
	return a * b;
}
if(op === "div"){
	return a / b;
}

return "invalid operator";