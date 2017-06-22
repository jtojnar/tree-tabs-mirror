// **********          REFRESH GUI          ***************

function SetTRefreshEvents(){
	$(window).on("resize", function(event){
		RefreshGUI();
	});

	// click on media icon
	$(document).on("mousedown", ".tab_mediaicon", function(event){
		event.stopPropagation();
		if (event.button == 0 && $(this).parent().parent().is(".audible, .muted")){
			chrome.tabs.get(parseInt(this.parentNode.parentNode.id), function(tab){
				chrome.tabs.update(tab.id, {muted:!tab.mutedInfo.muted});
			});
		}
	});
}

function RefreshGUI() {
	if ($("#toolbar").children().length > 0) {
		if ($("#button_tools, #button_search").is(".on")) {
			$("#toolbar").css({ "height": 53 });
		} else {
			$("#toolbar").css({ "height": 26 });
		}
	} else {
		$("#toolbar").css({ "height": 0 });
	}
	if ($("#pin_list").children().length == 0) {
		$("#pin_list").addClass("hidden");
	} else {
		$("#pin_list").removeClass("hidden");
	}
	$("#tab_list").css({ "height": $(window).height() - $("#pin_list").outerHeight() - $("#toolbar").outerHeight() });
}

// set discarded class
function RefreshDiscarded(tabId) {
	if ($("#" + tabId).length > 0) {
		chrome.tabs.get(parseInt(tabId), function(tab) {
			if (tab.discarded) {
				$("#" + tabId).addClass("discarded");
			} else {
				$("#" + tabId).removeClass("discarded");
			}
		});
	}
}

// change media icon
function RefreshMediaIcon(tabId) {
	if ($("#" + tabId).length > 0 && bg.tabs[tabId]) {
		chrome.tabs.get(parseInt(tabId), function(tab) {
			if (tab) {
				if (tab.mutedInfo.muted) {
					$("#" + tabId).removeClass("audible").addClass("muted");
				}
				if (!tab.mutedInfo.muted && tab.audible) {
					$("#" + tabId).removeClass("muted").addClass("audible");
				}
				if (!tab.mutedInfo.muted && !tab.audible) {
					$("#" + tabId).removeClass("audible").removeClass("muted");
				}
			}
		});
	}
}


// Vivaldi does not have changeInfo.audible listener, this is my own implementation, hopefully this will not affect performance too much
function VivaldiRefreshMediaIcons() {
	chrome.tabs.query({currentWindow: true}, function(tabs){
		$(".audible, .muted").removeClass("audible").removeClass("muted");
		tabs.forEach(function(Tab){
			if (Tab.audible) {
				$("#" + Tab.id).addClass("audible");
			}
			if (Tab.mutedInfo.muted) {
				$("#" + Tab.id).addClass("muted");
			}
		});
	});
	setTimeout(function() {
		VivaldiRefreshMediaIcons();
	}, 1400);
}


function GetFaviconAndTitle(tabId) {
	if ($("#" + tabId).length > 0 && bg.tabs[tabId]) {
		chrome.tabs.get(parseInt(tabId), function(tab) {

			if (tab && tab.status == "complete") {
				$("#" + tabId).removeClass("loading");
				var title = tab.title ? tab.title : tab.url;
				// change title
				$("#tab_title" + tab.id)[0].textContent = title;
				$("#tab_header" + tab.id).attr("title", title);
				
				// compatibility with various Tab suspender extensions
				if (tab.favIconUrl != undefined && tab.favIconUrl.match("data:image/png;base64") != null) {
					$("#tab_header" + tab.id).css({ "background-image": "url(" + tab.favIconUrl + ")" });
				} else {
					// case for internal pages, favicons don't have access, but can be loaded from url
					if (tab.url.match("opera://|vivaldi://|browser://|chrome://|chrome-extension://|about:") != null) {
						$("#tab_header" + tab.id).css({ "background-image": "url(chrome://favicon/" + tab.url + ")" });
					} else {
						// change favicon
						var img = new Image();
						img.src = tab.favIconUrl;
						img.onload = function() {
							$("#tab_header" + tab.id).css({ "background-image": "url(" + tab.favIconUrl + ")" });
						};
						img.onerror = function() {
							$("#tab_header" + tab.id).css({ "background-image": "url(chrome://favicon/" + tab.url + ")" });
						}
					}
				}
			}
			if (tab && tab.status == "loading") {
				$("#" + tabId).addClass("loading");
				var title = tab.title ? tab.title : bg.caption_loading;
				$("#tab_title" + tab.id)[0].textContent = title;
				$("#tab_header" + tab.id).attr("title", title);
				setTimeout(function() {
					if ($("#" + tabId).length != 0) GetFaviconAndTitle(tabId);
				}, 1000);
			}
		});
	}
}

// refresh open closed trees states
function RefreshExpandStates() {
	$(".children").each(function() {
		if ($(this).children().length > 0) {
			$(this).parent().removeClass("n");
			if ($(this).parent().is(":not(.o, .c)")) {
				$(this).parent().addClass("o");
			}
		} else {
			$(this).parent().removeClass("o").removeClass("c").addClass("n");
		}
	});
}