/* ---------- IMPORTS ------------------------------------------------------- */
var runfunc = require("./runfunc.js");
var express = require("express");
var app = express();


/* ---------- CONFIGURATION ------------------------------------------------- */
app.set("port", process.env.PORT || 8888);


/* ---------- ROUTES -------------------------------------------------------- */
app.get("/task", function(req, res){
	var params = req.query;
	// prepare function
	var script = params["_box_script"];
	delete params["_box_script"];
	var functionString = runfunc.buildFunctionString(script, params);
	// run function, wait for completion, then send result back client
	var result = runfunc.runFunction(functionString);
	var interavalId = setInterval(function(){
		if(result.done){
			clearInterval(interavalId);
			res.status(200).send(JSON.stringify(result.result));
		}
	}, 0);
});

/* ---------- RUN SERVER ---------------------------------------------------- */
app.listen(app.get("port"));
console.log("Listening on " + app.get("port"));