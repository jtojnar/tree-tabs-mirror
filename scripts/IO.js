// **********      KEYBOARD AND MOUSE       ***************

function SetIOEvents(){


	// scroll horizontally on pin list
	$("#pin_list").mousewheel(function(event, delta){
		this.scrollLeft-= (delta * 30);
		event.preventDefault();
	});


	// catch keyboard keys
	$(document).keydown(function(e){
		if (IOKeys.MouseHoverOver.match("pin_list|tab_list|groups_container")){
			if (e.which == 16){
				IOKeys.Shift = true;
			}
			if (e.which == 17){
				IOKeys.Ctrl = true;
			}
			if (e.which == 65){
				IOKeys.a = true;
			}
			if (e.which == 73){
				IOKeys.i = true;
			}
			if (IOKeys.Ctrl && IOKeys.a){
				if (IOKeys.MouseHoverOver == "pin_list"){
					$(".pin").addClass("selected");
				}
				if (IOKeys.MouseHoverOver == "tab_list"){
					$(".tab:visible").addClass("selected");
				}
			}
			if (IOKeys.Ctrl && IOKeys.i){
				if (IOKeys.MouseHoverOver == "pin_list"){
					$(".pin").toggleClass("selected");
				}
				if (IOKeys.MouseHoverOver == "tab_list"){
					$(".tab:visible").toggleClass("selected");
				}
			}
		}
		RefreshGUI();
	});

	// clear pressed keys on key_up
	$(document).keyup(function(e){
		if (e.which == 16){
			IOKeys.Shift = false;
		}
		if (e.which == 17){
			IOKeys.Ctrl = false;
		}
		if (e.which == 65){
			IOKeys.a = false;
		}
		if (e.which == 73){
			IOKeys.i = false;
		}
	});

	$(document).on("dragend", "", function(event){
		IOKeys.LMB = false;
	});
	$(document).on("dragenter", "#groups_container, #toolbar", function(event){ // set mouse over id
		IOKeys.MouseHoverOver = this.id;
	});
	$(document).on("mouseenter", "#pin_list, #tab_list, #groups_container, #toolbar", function(event){ // set mouse over id
		IOKeys.MouseHoverOver = this.id;
	});
	$(document).on("mouseleave", window, function(event){
		ClearPressedKeys();
	});
	$(document).on("mouseup", "body", function(event){
		IOKeys.LMB = false;
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

function ClearPressedKeys(){
	IOKeys.MouseHoverOver = "";
	IOKeys.LMB = false;
	IOKeys.Ctrl = false;
	IOKeys.Shift = false;
	IOKeys.a = false;
	IOKeys.i = false;
}
