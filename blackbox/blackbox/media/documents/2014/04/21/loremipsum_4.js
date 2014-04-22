var words = parseInt(params["words"]);
var jsonp = params["jsonp"];

// max is 1000 words
if(words > 1000) {
	words = 1000;
}

// preset lorem
var lorem = "Aliquam dolor turpis, sodales vitae dui vel, blandit tincidunt diam. Vestibulum ut tortor iaculis, porta libero eleifend, lobortis tortor. Sed imperdiet purus at mi consectetur lobortis. Aliquam erat volutpat. Nulla facilisi. Vestibulum volutpat ligula nunc, in pellentesque urna bibendum et. Ut quis gravida metus. Aenean neque nisi, porttitor in tempor at, ullamcorper sed turpis.";
var split = lorem.split(" ");

// compute new lorem
var str = "";
for(var i = 0; i < words; i++){
	var index = Math.floor(Math.random()*split.length);
	var word = split[index];
	str += word;
}

// clean up 
if(str[str.length-1] === ","){
	str[str.length-1] = ".";
} else if(str[str.length-1] !== ".") {
	str += ".";
}

// handle JSONP
if(jsonp){
	return "lorem = {data: '" + str + "'};"; 
} else {
	return {data: str};
}