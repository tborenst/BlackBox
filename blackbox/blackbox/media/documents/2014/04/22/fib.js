n = parseInt(params["n"]);

var fib = function(n){
	if(n === 0 || n === 1){
		return n;
	} else {
		return fib(n-1) + fib(n-2);
	}
}

return {result: fib(n)};