// **********             TOOLBAR           ***************

function SaveToolbarOptions(){
	chrome.runtime.sendMessage({command: "toolbar_options_save"});
}

function SetToolbarEvents(){
	// tools and search buttons toggle
	$(document).on("mousedown", "#button_tools, #button_search", function(event){
		if (event.button != 0){
			return;
		}
		if ($(this).is(".on")){
			$("#button_tools, #button_search").removeClass("on");
			$("#toolbar_tools, #toolbar_search").addClass("hidden");
			bg.opt_toolbar.active_toolbar_tool = "";
		} else {
			$(this).addClass("on");
			if ($(this).is("#button_tools")){
				$("#button_search").removeClass("on");
				$("#toolbar_search").addClass("hidden");
				$("#toolbar_tools").removeClass("hidden");
				bg.opt_toolbar.active_toolbar_tool = "tools";
			} else {
				$("#button_tools").removeClass("on");
				$("#toolbar_tools").addClass("hidden");
				$("#toolbar_search").removeClass("hidden");
				bg.opt_toolbar.active_toolbar_tool = "search";
			}
		}
		RefreshGUI();
		SaveToolbarOptions();
	});


	// go to previous search result
	$(document).on("mousedown", "#filter_search_go_prev", function(event){
		if (event.button != 0){
			return;
		}
		if (SearchIndex == 0){
			SearchIndex = $(".tab.filtered").length-1;
		} else {
			SearchIndex--;
		}
		$(".highlighted_search").removeClass("highlighted_search");
		$($(".tab.filtered")[SearchIndex]).addClass("highlighted_search");
		ScrollToTab($(".tab.filtered")[SearchIndex].id);
	});

	// go to next search result
	$(document).on("mousedown", "#filter_search_go_next", function(event){
		if (event.button != 0){
			return;
		}
		if (SearchIndex == $(".tab.filtered").length-1){
			SearchIndex = 0;
		} else {
			SearchIndex++;
		}
		$(".highlighted_search").removeClass("highlighted_search");
		$($(".tab.filtered")[SearchIndex]).addClass("highlighted_search");
		ScrollToTab($(".tab.filtered")[SearchIndex].id);
	});


	// new tab
	$(document).on("mousedown", "#button_new", function(event){
		if (event.button == 0){
			chrome.tabs.create({});
		}
		if (event.button == 1){
			chrome.tabs.query({windowId: CurrentWindowId, active: true}, function(tabs){
				chrome.tabs.duplicate(tabs[0].id, function(tab){
					setTimeout(function(){
						$("#"+tab.id).insertAfter($(".active")[0]);
					}, 300);
				});
			});
		}
		if (event.button == 2){
			chrome.tabs.query({windowId: CurrentWindowId, active: true}, function(tabs){
				ScrollToTab(tabs[0].id);
			});
		}
	});
	// pin tab
	$(document).on("mousedown", "#button_pin", function(event){
		if (event.button != 0){
			return;
		}
		$(".selected:visible").each(function(){
			chrome.tabs.update(parseInt(this.id), { pinned: ($(this).is(".pin") ? false : true) });
		});
	});
	// undo close
	$(document).on("mousedown", "#button_undo", function(event){
		if (event.button != 0){
			return;
		}
		chrome.sessions.getRecentlyClosed( null, function(sessions){
			if (sessions.length > 0){
				chrome.sessions.restore(null, function(){});
			}
		});
	});
	// move tab to new window (detach)
	$(document).on("mousedown", "#button_move", function(event){
		if (event.button != 0){
			return;
		}
		var tabsArr = [];
		$(".selected:visible").each(function(){
			tabsArr.push(parseInt(this.id));
			if ($("#ch"+this.id).children().length > 0){
				$($("#ch"+this.id).find(".tab")).each(function(){
					tabsArr.push(parseInt(this.id));
				});
			}
		});
		DetachTabs(tabsArr);
	});
	// move tab to new window (detach)
	$(document).on("mousedown", "#repeat_search", function(event){
		if (event.button != 0){
			return;
		}
		FindTab($("#filter_box")[0].value);
	});
	// filter on input
	$("#filter_box").on("input", function(){
		if ($("#filter_box")[0].value == ""){
			$("#button_filter_clear").css({"opacity": "0"}).attr("title", "");
		} else {
			$("#button_filter_clear").css({"opacity": "1"});
			$("#button_filter_clear").attr("title", bg.caption_clear_filter);
		}
		FindTab($("#filter_box")[0].value);
	});
	// change filtering type
	$(document).on("mousedown", "#button_filter_type", function(event){
		if (event.button != 0){
			return;
		}
		$("#button_filter_type").toggleClass("url").toggleClass("title");
		if (bg.opt_toolbar.filter_type == "url"){
			bg.opt_toolbar.filter_type = "title";
		} else {
			bg.opt_toolbar.filter_type = "url";
		}
		FindTab($("#filter_box")[0].value);
		SaveToolbarOptions();
	});
	// clear filter button
	$(document).on("mousedown", "#button_filter_clear", function(event){
		if (event.button != 0){
			return;
		}
		$("#button_filter_clear").css({"opacity": "0"}).attr("title", "");
		FindTab("");
	});
	// sort tabs
	$(document).on("mousedown", "#button_sort", function(event){
		if (event.button != 0){
			return;
		}
		SortTabs();
	});
	// bookmarks
	$(document).on("mousedown", "#button_bookmarks", function(event){
		if (event.button != 0){
			return;
		}
		chrome.tabs.create({url: "chrome://bookmarks/"});
	});
	// downloads
	$(document).on("mousedown", "#button_downloads", function(event){
		if (event.button != 0){
			return;
		}
		chrome.tabs.create({url: "chrome://downloads/"});
	});
	// history
	$(document).on("mousedown", "#button_history", function(event){
		if (event.button != 0){
			return;
		}
		chrome.tabs.create({url: "chrome://history/"});
	});
	// extensions
	$(document).on("mousedown", "#button_extensions", function(event){
		if (event.button != 0){
			return;
		}
		chrome.tabs.create({url: "chrome://extensions"});
	});
	// settings
	$(document).on("mousedown", "#button_settings", function(event){
		if (event.button != 0){
			return;
		}
		chrome.tabs.create({url: "chrome://settings/"});
	});
	// vertical tabs options
	$(document).on("mousedown", "#button_options", function(event){
		if (event.button != 0){
			return;
		}
		chrome.tabs.create({url: "options.html" });
	});
	// discard tabs
	$(document).on("mousedown", "#button_discard", function(event){
		if (event.button != 0){
			return;
		}
		chrome.tabs.query({windowId: CurrentWindowId, pinned: false}, function(tabs){
			var tabsIds = [];
			tabs.forEach(function(Tab){
				tabsIds.push(Tab.id);
			});
			DiscardTabs(tabsIds);
		});
	});
}