// **********      KEYBOARD AND MOUSE       ***************

function SetIOEvents(){

	// scroll horizontally on pin list
	$("#pin_list").bind("mousewheel DOMMouseScroll", function(event) {
		event = event.originalEvent;
		var delta = event.wheelDelta > 0 || event.detail < 0 ? -1 : 1;
			var multiplier = 1;
			for (var t = 1; t < 20; t++){
				setTimeout(function(){
					$("#pin_list").scrollLeft($("#pin_list").scrollLeft()+(delta*multiplier));
				}, t);
				multiplier++;
			}
			multiplier = 20;
			for (var t = 21; t < 40; t++){
				setTimeout(function(){
					$("#pin_list").scrollLeft($("#pin_list").scrollLeft()+(delta*multiplier));
				}, t);
				multiplier--;
			}

	});
	
	// this is for faster scrolling in firefox, for some reason its default scrolling is slow
	if (bg.opt.faster_scroll){
		$("#tab_list").bind("mousewheel DOMMouseScroll", function(event) {
			event = event.originalEvent;
			var delta = event.wheelDelta > 0 || event.detail < 0 ? -1.5 : 1.5;
			var multiplier = 1;
			for (var t = 1; t < 40; t++){
				setTimeout(function(){
					$("#tab_list").scrollTop($("#tab_list").scrollTop()+(delta*multiplier));
				}, t);
				multiplier++;
			}
			multiplier = 40;
			for (var t = 41; t < 80; t++){
				setTimeout(function(){
					$("#tab_list").scrollTop($("#tab_list").scrollTop()+(delta*multiplier));
				}, t);
				multiplier--;
			}
		});
	}

	// catch keyboard keys
	$(document).keydown(function(event){
		if (MouseHoverOver == "pin_list"){
			// ctrl+a to select all
			if (event.ctrlKey && event.which == 65){
				$(".pin").addClass("selected");
			}
			// ctrl+i to invert selection
			if (event.ctrlKey && event.which == 73){
				$(".pin").toggleClass("selected");
			}
		}
		if (MouseHoverOver == "tab_list"){
			// ctrl+a to select all
			if (event.ctrlKey && event.which == 65){
				$(".tab").addClass("selected");
			}
			// ctrl+i to invert selection
			if (event.ctrlKey && event.which == 73){
				$(".tab").toggleClass("selected");
			}
		}
		RefreshGUI();
	});

	$(document).on("dragenter", "#toolbar", function(event){ // set mouse over id
		MouseHoverOver = this.id;
	});
	$(document).on("mouseenter", "#pin_list, #tab_list, #toolbar", function(event){ // set mouse over id
		MouseHoverOver = this.id;
	});
	$(document).on("mouseleave", window, function(event){
		MouseHoverOver = "";
	});

	// remove middle mouse and set hiding menu
	document.body.onmousedown = function(event){
		if (event.button == 1 && bg.opt.close_with_MMB == true){
			event.preventDefault();
		}
		if (event.button == 0 && !$(event.target).is(".menu_item")){
			$(".menu").hide(0);
		}
	};
}
