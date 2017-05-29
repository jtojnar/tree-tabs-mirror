// **********       TABS FUNCTIONS          ***************

function UpdateData(){
	setTimeout(function(){
		// changed it from 1 to 2 if there are some more changes queued, just in case if something did not catch in the first loop
		if (schedule_update_data > 1){
			schedule_update_data = 2;
		}
		if (schedule_update_data > 0){
			$(".pin").each(function(){
				if (bg.tabs[this.id]){
					bg.tabs[this.id].p = "pin_list";
					bg.tabs[this.id].n = $(this).index();
					bg.tabs[this.id].o = "n";
				}
			});
			$(".tab").each(function(){
				if (bg.tabs[this.id]){
					bg.tabs[this.id].n = $(this).index();
					if ($(this).parent().parent()[0].id){
						bg.tabs[this.id].p = $(this).parent().parent()[0].id;
					} else {
						bg.tabs[this.id].p = "tab_list";
					}
					if ($(this).is(".n")){
						bg.tabs[this.id].o = "n";
					} else {
						if ($(this).is(".c")){
							bg.tabs[this.id].o = "c";
						} else {
							bg.tabs[this.id].o = "o";
						}
					}
				}
			});
			bg.schedule_save++;
			schedule_update_data--;
		} else {
		}
		UpdateData();
	},2000);
}

function AppendTab(p){
	if ($("#"+p.tab.id).length > 0){
		GetFaviconAndTitle(p.tab.id);
		return;
	}	
	
	var div_tab = document.createElement("div");
	div_tab.id = p.tab.id;
	div_tab.className = p.tab.pinned ? "pin" : "tab n";
	div_tab.innerHTML = 
		"<div class='drop_target drag_enter_center' id=dc"+p.tab.id+"></div>"+
		"<div class='drop_target drag_entered_top' id=du"+p.tab.id+"></div>"+
		"<div class='drop_target drag_entered_bottom' id=dd"+p.tab.id+"></div>"+
		"<div class=expand id=exp"+p.tab.id+">"+
			"<div class=exp_line_v id=exp_line_v"+p.tab.id+"></div>"+
			"<div class=exp_line_h id=exp_line_h"+p.tab.id+"></div>"+
			"<div class=exp_box id=exp_box"+p.tab.id+"></div>"+
		"</div>"+
		"<div class=tab_header id=tab_header"+p.tab.id+" draggable=true>"+
			"<div class=tab_title id=tab_title"+p.tab.id+"></div>"+
			
			
			(bg.opt.never_show_close ? "" : 
				("<div class=close id=close"+p.tab.id+"><div class=close_img id=close_img"+p.tab.id+"></div></div>")
			)+
			
			
			"<div class=tab_mediaicon id=tab_mediaicon"+p.tab.id+"></div>"+
		"</div>"+
		"<div class=children id=ch"+p.tab.id+"></div>";
		

	if (($("#"+p.InsertAfterId).is(".pin") && p.tab.pinned) || ($("#"+p.InsertAfterId).is(".tab") && !p.tab.pinned)){
		$("#"+p.InsertAfterId).parent()[0].append(div_tab);
		$("#"+p.tab.id).insertAfter($("#"+p.InsertAfterId));
		p.ParentId = undefined;
	} else {
		p.InsertAfterId = undefined;
	}
	
	if ($("#"+p.ParentId).length > 0 && $("#"+p.ParentId).is(".tab") && !p.tab.pinned){
		if ($("#ch"+p.ParentId).children().length == 0){
			$("#"+p.ParentId).addClass("o").removeClass("n").removeClass("c");
		}
		if (p.Append){
			$("#ch"+p.ParentId).append(div_tab);
		}
		if (!p.Append){
			$("#ch"+p.ParentId).prepend(div_tab);
		}
	} else {
		p.ParentId = undefined;
	}
		
	if (p.InsertAfterId == undefined && p.ParentId == undefined){
		if (p.Append){
			$(p.tab.pinned ? "#pin_list" : "#tab_list").append(div_tab);
		}			
		if (!p.Append){
			$(p.tab.pinned ? "#pin_list" : "#tab_list").prepend(div_tab);
		}
	}
	
	
	if (bg.opt.always_show_close){
		$("#tab_header"+p.tab.id).addClass("close_show");
	} 
	GetFaviconAndTitle(p.tab.id);
	RefreshMediaIcon(p.tab.id);
	
	if (p.tab.discarded){
		$("#"+p.tab.id).addClass("discarded");
	}
	if (p.tab.active){
		SetActiveTab(p.tab.id);
	}
}

function RemoveTabFromList(tabId){
	if ($("#"+tabId).length > 0){
		$("#"+tabId).remove();
	}
}

function SetTabClass(p){
	if (p.pin){
		$("#pin_list").append($("#"+p.id));
		// flatten out children
		if ($("#ch"+p.id).children().length > 0){
			$($("#"+p.id).children().find(".pin, .tab").get().reverse()).each(function(){
				$(this).removeClass("tab").removeClass("n").removeClass("o").removeClass("c").addClass("pin");
				$(this).insertAfter($("#"+p.id));
				chrome.tabs.update(parseInt(this.id), {pinned: true});
			});
		}
		$("#"+p.id).removeClass("tab").removeClass("n").removeClass("o").removeClass("c").addClass("pin");
	} else {
		$("#tab_list").prepend($("#"+p.id));
		
		$("#"+p.id).removeClass("pin").addClass("tab");
		RefreshExpandStates();
	}
	chrome.tabs.update(parseInt(p.id), {pinned: p.pin});
	RefreshGUI();
}

function SetActiveTab(tabId){
	if ($("#"+tabId).length > 0){
		$(".active").removeClass("active").removeClass("selected");
		$(".pin, .tab").removeClass("active").removeClass("selected").removeClass("frozen").removeClass("temporary").removeClass("tab_header_hover");
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$("#"+tabId).addClass("active").addClass("selected");
		ScrollToTab(tabId);
	}
}

function ScrollToTab(tabId){
	if ($("#"+tabId).length == 0){
		return false;
	}
	if ($("#"+tabId).is(":not(:visible)")){
		$("#"+tabId).parents(".tab").removeClass("c").addClass("o");
	}
	
	if ($("#"+tabId).is(".pin")){
		if ($("#"+tabId).position().left+$("#"+tabId).outerWidth() > $("#pin_list").innerWidth()){
			$("#pin_list").scrollLeft($("#pin_list").scrollLeft()+$("#"+tabId).position().left+$("#"+tabId).outerWidth()-$("#pin_list").innerWidth());
		} else {
			if ($("#"+tabId).position().left < 0){
				$("#pin_list").scrollLeft($("#pin_list").scrollLeft()+$("#"+tabId).position().left);
			}
		}
	}
	if ($("#"+tabId).is(".tab")){
		if ($("#"+tabId).offset().top - $("#tab_list").offset().top < 0){
			$("#tab_list").scrollTop($("#tab_list").scrollTop() + $("#"+tabId).offset().top - $("#tab_list").offset().top);
		} else {
			if ($("#"+tabId).offset().top - $("#tab_list").offset().top > $("#tab_list").innerHeight() - $(".tab_header").outerHeight()){
				$("#tab_list").scrollTop($("#tab_list").scrollTop() + $("#"+tabId).offset().top - $("#tab_list").offset().top - $("#tab_list").innerHeight() + $(".tab_header").outerHeight() + 4);
			}
		}
	}
}

function DetachTabs(tabsIds){
	chrome.windows.get(CurrentWindowId, {populate : true}, function(window){
		if (window.tabs.length == 1){
			return;
		}
		chrome.windows.create({state:window.state}, function(new_window){
			chrome.tabs.move(tabsIds[0], {windowId: new_window.id, index:-1});
			chrome.tabs.remove(new_window.tabs[0].id, null);
			for (var i = 1; i < tabsIds.length; i++){
				chrome.tabs.move(tabsIds[i], {windowId: new_window.id, index:-1});
			}
		})
	});
}

// find and select tabs
function FindTab(input){
	$(".filtered").removeClass("filtered").removeClass("selected");
	$(".highlighted_search").removeClass("highlighted_search");
	if (input.length == 0){
		$("#filter_box")[0].value = "";
		return;
	}
	SearchIndex = 0;
	chrome.tabs.query({windowId: CurrentWindowId, pinned: false}, function(tabs){
		tabs.forEach(function(Tab){
			if (bg.opt_toolbar.filter_type == "url" && Tab.url.toLowerCase().match(input.toLowerCase())){
				$("#"+Tab.id).addClass("filtered").addClass("selected");
			}
			if (bg.opt_toolbar.filter_type == "title" && Tab.title.toLowerCase().match(input.toLowerCase())){
				$("#"+Tab.id).addClass("filtered").addClass("selected");
			}
		});
	});
}

function CloseTabs(tabsIds){
	tabsIds.forEach(function(tabId) {
		if ($("#"+tabId).is(".pin") && bg.opt.allow_pin_close){
			$("#"+tabId).remove();
			chrome.tabs.update(tabId, {pinned: false});
		}
		if ($("#"+tabId).is(".tab")){
			$("#"+tabId).remove();
		}
	});
	setTimeout(function(){
		chrome.tabs.remove(tabsIds, null);
	},100);
}


function DiscardTabs(tabsIds){
	var delay = 400;
	if ($("#"+tabsIds[0]).is(".discarded")){
		delay = 5;
	} else {
		chrome.tabs.discard(tabsIds[0]);
	}
	tabsIds.splice(0, 1);
	if (tabsIds.length > 0){
		setTimeout(function(){
			DiscardTabs(tabsIds);
		},delay);
	}
}


function ActivateNextTab(){
	if ($(".active").is(".pin")){
		if ($(".active").next()[0]){
			chrome.tabs.update(parseInt($(".active").next()[0].id), { active: true });
		} 
	}
	
	if ($(".active").is(".tab")){
		if ($(".active").children().last().children()[0]){
			chrome.tabs.update(parseInt($(".active").children().last().children()[0].id), { active: true });
		} else {
			if ($(".active").next()[0]){
				chrome.tabs.update(parseInt($(".active").next()[0].id), { active: true });
			} else {
				if ($(".active").parent().parent().next().is(".tab")){
					chrome.tabs.update(parseInt($(".active").parent().parent().next()[0].id), { active: true });
				} else {
					if ($(".active").parents(".tab").eq(-2).next().is(".tab")){
						chrome.tabs.update(parseInt($(".active").parents(".tab").eq(-2).next()[0].id), { active: true });
					}
				}

			
			}
		}
	}
}

function ActivatePrevTab(){
	if ($(".active").is(".pin")){
		if ($(".active").prev()[0]){
			chrome.tabs.update(parseInt($(".active").prev()[0].id), { active: true });
		} 
	}
	
	if ($(".active").is(".tab")){
		if ($(".active").prev().find(".tab").length > 0){
			chrome.tabs.update(parseInt($(".active").prev().find(".tab").last()[0].id), { active: true });
		} else {
			if ($(".active").prev()[0]){
				chrome.tabs.update(parseInt($(".active").prev()[0].id), { active: true });
			} else {
				if ($(".active").parent().is(".children")){
					chrome.tabs.update(parseInt($(".active").parent().parent()[0].id), { active: true });
				}
			}
		}

	}

}

function DropTargetsSendToFront(){
	if (DropTargetsInFront == false){
		$(".drop_target").show();
		DropTargetsInFront = true;
	}
}
function DropTargetsSendToBack(){
	if (DropTargetsInFront){
		$(".drop_target").hide();
		DropTargetsInFront = false;
	}
}