setInterval(function(){
	var script = document.getElementById("script");
	var fileChosen = document.getElementById("file_chosen_decoy");
	var value = script.value.slice(12);
	if(value === ""){
		fileChosen.innerText = "No file chosen"
	} else {
		fileChosen.innerText = value;
	}

	var doc = document.getElementById("documentation");
	var fileChosen2 = document.getElementById("file_chosen_decoy_2");
	var value2 = doc.value.slice(12);
	if(value2 === ""){
		fileChosen2.innerText = "No file chosen"
	} else {
		fileChosen2.innerText = value2;
	}
}, 200);