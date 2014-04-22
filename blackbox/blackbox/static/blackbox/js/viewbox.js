;(function(){
	var docDiv = document.getElementById("showdown");
	var docText = docDiv.innerText;
	var converter = new Showdown.converter();
	var html = converter.makeHtml(docText);
	docDiv.innerHTML = html;
	docDiv.className = "";
})();

