var gender = params["gender"];
var boy_firsts = ["Bob", "Mark", "Steven", "Jeff", "David", "George", "Kevin", "Joey"];
var grl_firsts = ["Venessa", "Britney", "Margaret", "Alice", "Joey", "Anna"];
var lasts = ["Smith", "Miller", "Johnson", "Cohen", "Jones", "Williams", "Jackson"];

// if parameter is malformatted, defaults to girl names
var to_use = (gender === "M") ? boy_firsts : grl_firsts;

var first_index = Math.floor((Math.random()*to_use.length));
var last_index = Math.floor((Math.random()*lasts.length));

return {name: to_use[first_index] + " " + lasts[last_index]};
