
result = null;
done = false;

http.get("http://www.google.com", function(res){
	done = true;
	result = res;
	return result;
}.bind(this)).on("error", function(error){
	done = true;
	result = error;
	return result;
}.bind(this));