window.onready = function(){
	var likeBtn = $("#like_button");
	var boxid = $("#box_id").text();
	var act = $("#like_act");
	likeBtn.click(function(){
		$.get("/likebox?uid="+boxid, function(data){
			if(act.html().indexOf("Un") === -1){
				act.text("[ Unlike ]");
			} else {
				act.text("[ Like ]");
			}
		});
	});

	setInterval(function(){
		$.get("/getlikes?uid="+boxid, function(data){
			$(".like_num").html(data);
		});
	}, 100);
};