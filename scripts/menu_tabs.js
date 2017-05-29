// **********			 TABS MENU		 ***************

function SetMenu() {
	// set menu labels
	$(".menu_item").each(function() {
		$(this).text(chrome.i18n.getMessage(this.id));
	});

	// trigger action when the contexmenu is about to be shown
	$(document).bind("contextmenu", function(event) {
		event.preventDefault();
	});

	// show menu
	$(document).on("mousedown", "#pin_list, #tab_list, .tab, .pin", function(event) {
		event.stopPropagation();
		if (event.button == 2) {
			$(".menu").hide(0);

			if ($(this).is(".tab, .pin")) {
				menuTabId = parseInt($(this)[0].id);
			} else {
				menuTabId = parseInt($(".active")[0].id);
			}
			if ($("#" + menuTabId).is(".pin")) {
				$("#tabs_menu_pin").text(chrome.i18n.getMessage("tabs_menu_unpin"));
				$("#tabs_menu_close").prev().css({ "display": "none" });
				$("#tabs_menu_close_other").css({ "display": "none" });

				$("#tabs_menu_expand_all, #tabs_menu_collapse_all").css({ "display": "none" });
				$("#tabs_menu_collapse_all").next().css({ "display": "none" });

				if (!bg.opt.allow_pin_close) {
					$("#tabs_menu_close").css({ "display": "none" });
				}
			} else {
				$("#tabs_menu_pin").text(chrome.i18n.getMessage("tabs_menu_pin"));
				$("#tabs_menu_close").prev().css({ "display": "" });
				$("#tabs_menu_close, #tabs_menu_close_other").css({ "display": "" });

				$("#tabs_menu_expand_all, #tabs_menu_collapse_all").css({ "display": "" });
				$("#tabs_menu_collapse_all").next().css({ "display": "" });
			}

			if ($("#" + menuTabId).is(".o, .c")) {
				$("#tabs_menu_close_tree").css({ "display": "" });
			} else {
				$("#tabs_menu_close_tree").css({ "display": "none" });
			}

			// MUTE TABS
			if ($("#" + menuTabId).is(".muted")) {
				$("#tabs_menu_mute").css({ "display": "none" });
				$("#tabs_menu_unmute").css({ "display": "" });
			} else {
				$("#tabs_menu_mute").css({ "display": "" });
				$("#tabs_menu_unmute").css({ "display": "none" });
			}


			// APPEND TABS TO BG.DATA ARRAY
			bg.dt.tabsIds = $("#" + menuTabId).is(".selected") ? $(".tab.selected:visible").map(function() { return parseInt(this.id); }).toArray() : [menuTabId];

			// show contextmenu with correct size position
			if ($("#tabs_menu").outerWidth() > $(window).width() - 10) {
				$("#tabs_menu").css({ "width": $(window).width() - 10 });
			} else {
				$("#tabs_menu").css({ "width": "" });
			}
			var x = event.pageX >= $(window).width() - $("#tabs_menu").outerWidth() ? $(window).width() - $("#tabs_menu").outerWidth() : event.pageX;
			var y = event.pageY >= $(window).height() - $("#tabs_menu").outerHeight() - 10 ? $(window).height() - $("#tabs_menu").outerHeight() - 10 : event.pageY;
			$("#tabs_menu").css({ "display": "block", "top": y - 15, "left": x - 5 });
		}
	});

	// hide menu
	$(document).on("mousedown", "body", function(event) {
		if (event.button != 2) {
			$(".menu").hide(300);
		}
	});

	$(document).on("mouseleave", "body", function(event) {
		$(".menu").hide(300);
	});

	// if the menu element is clicked
	$(document).on("mousedown", "#tabs_menu li", function(event) {
		if (event.button != 0) {
			return;
		}
		event.stopPropagation();
		switch ($(this).attr("data-action")) {
			case "tab_new":
				chrome.tabs.create({});
				break;
			case "tab_clone":
				if ($("#" + menuTabId).is(".selected")) {
					$(".selected:visible").each(function() {
						chrome.tabs.duplicate(parseInt(this.id));
					});
				} else {
					chrome.tabs.duplicate(menuTabId);
				}
				break;
			case "tab_move":
				if ($("#" + menuTabId).is(".selected")) {
					DetachTabs($(".selected:visible").map(function() { return parseInt(this.id); }).toArray());
				} else {
					DetachTabs([menuTabId]);
				}
				break;
			case "tab_reload":
				if ($("#" + menuTabId).is(".selected")) {
					$(".selected:visible").each(function() {
						chrome.tabs.reload(parseInt(this.id));
					});
				} else {
					chrome.tabs.reload(menuTabId);
				}
				break;
			case "tab_pin":
				if ($("#" + menuTabId).is(".selected")) {
					$(".selected:visible").each(function() {
						chrome.tabs.update(parseInt(this.id), { pinned: ($("#" + menuTabId).is(".pin") ? false : true) });
					});
				} else {
					chrome.tabs.update(menuTabId, { pinned: ($("#" + menuTabId).is(".pin") ? false : true) });
				}
				break;
			case "tab_mute":
				if ($("#" + menuTabId).is(".selected")) {
					$(".selected:visible").each(function() {
						chrome.tabs.get(parseInt(this.id), function(tab) {
							chrome.tabs.update(tab.id, { muted: true });
						});
					});
				} else {
					chrome.tabs.get(menuTabId, function(tab) {
						chrome.tabs.update(tab.id, { muted: true });
					});
				}
				break;
			case "tab_unmute":
				if ($("#" + menuTabId).is(".selected")) {
					$(".selected:visible").each(function() {
						chrome.tabs.get(parseInt(this.id), function(tab) {
							chrome.tabs.update(tab.id, { muted: false });
						});
					});
				} else {
					chrome.tabs.get(menuTabId, function(tab) {
						chrome.tabs.update(tab.id, { muted: false });
					});
				}
				break;
			case "tab_mute_other":
				if ($("#" + menuTabId).is(".selected")) {
					$(".tab:visible:not(.selected)").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: true });
					});
				} else {
					$(".tab:visible:not(#" + menuTabId + ")").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: true });
					});
				}
				break;
			case "tab_unmute_other":
				if ($("#" + menuTabId).is(".selected")) {
					$(".tab:visible:not(.selected)").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: false });
					});
				} else {
					$(".tab:visible:not(#" + menuTabId + ")").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: false });
					});
				}
				break;
			case "tab_close":
				CloseTabs($("#" + menuTabId).is(".selected") ? $(".selected:visible").map(function() { return parseInt(this.id); }).toArray() : [menuTabId]);
				break;
			case "tab_close_tree":
				CloseTabs($("#" + menuTabId).find(".tab").map(function() { return parseInt(this.id); }).toArray());
				CloseTabs([menuTabId]);
				break;
			case "tab_close_other":
				CloseTabs($(".tab:visible:not(#" + menuTabId + ")").map(function() { return parseInt(this.id); }).toArray());
				break;
			case "tab_undo_close":
				chrome.sessions.getRecentlyClosed(null, function(sessions) {
					if (sessions.length > 0) {
						chrome.sessions.restore(null, function() {});
					}
				});
				break;
			case "tab_discard":
				DiscardTabs(bg.dt.tabsIds);
				break;
			case "tab_settings":
				chrome.tabs.create({ "url": "options.html" });
				break;
			case "tab_expand_all":
				$(".tab.c").addClass("o").removeClass("c");
				schedule_update_data++;
				break;
			case "tab_collapse_all":
				$(".tab.o").addClass("c").removeClass("o");
				schedule_update_data++;
				break;
		}
		$(".menu").hide(0);
	});
}