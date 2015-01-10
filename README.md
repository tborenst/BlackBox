BlackBox
======

This is a self-directed student project I made for Carnegie Mellon's "Web Applications" course, 15-437. It isn't currently hosted anywhere, but feel free to download it and fire it up yourself (requires Django and Node.js to be installed).

### Overview

BlackBox allows users to upload self-contained Javascript functions referred to as "Boxes". Each Box is a Javascript function and can have an arbitrary number of arguments. Other users can then browse Boxes and view their documentation (similarly to GitHub users browsing repos), and *invoke* the code in specific Boxes via GET requests.

### Example

For example, if I wanted to make a very simple Calculator Box that takes two numbers and an operator, then returns the result to the user, I would create a new Box and upload this code:

```javascript
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
```

Then, to use the calculator I would simply send a GET request:

`http://www.blackbox.com/callbox/{{box-id}}?num1=3&num2=4&op=sub`


