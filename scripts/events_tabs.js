// **********		  TABS EVENTS		  ***************

function SetTabEvents() {
	// double click to create tab
	$(document).on("dblclick", "#tab_list, #pin_list, .expand", function(event) {
		if (event.button == 0 && $(this).parent().is(".n")) {
			chrome.tabs.create({});
		}
		if (event.button == 0 && event.target.id == "tab_list") {
			chrome.tabs.create({});
		}
		if (event.button == 0 && event.target.id == "pin_list") {
			chrome.tabs.create({ pinned: true });
		}
	});

	$(document).on("mouseenter", ".close", function(event) {
		$(this).addClass("close_hover");
	});

	$(document).on("mouseleave", ".close", function(event) {
		$(".close_hover").removeClass("close_hover");
	});

	$(document).on("mouseover", ".tab_header", function(event) {
		$(this).addClass("tab_header_hover");

		if (bg.opt.always_show_close == false) {
			$(this).addClass("close_show");
		}
	});

	$(document).on("mouseleave", ".tab_header", function(event) {
		$(this).removeClass("tab_header_hover");

		if (bg.opt.always_show_close == false) {
			$(this).removeClass("close_show");
		}
	});

	// PREVENT THE DEFAULT BROWSER DROP ACTION
	$(document).bind("drop dragover", function(event) {
		event.preventDefault();
	});


	// bring to front drop zones
	$(document).on("dragover", ".tab_header", function(event) {
		DropTargetsSendToFront();
	});

	// SET DRAG SOURCE
	$(document).on("dragstart", ".tab_header", function(event) {
		event.stopPropagation();
		bg.dt.tabsIds.splice(0, bg.dt.tabsIds.length);

		event.originalEvent.dataTransfer.setData("null", "null");
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);

		DragNode = $(this).parent()[0];
		$(".close").removeClass("show");
		$(".tab_header_hover").removeClass("tab_header_hover");
		$(this).parent().addClass("tab_header_hover");

		if ($(this).parent().is(":not(.selected)")) {
			$(".selected").addClass("frozen").removeClass("selected");
			$(this).parent().addClass("temporary").addClass("selected");
		}

		$(".selected").each(function() {
			bg.dt.tabsIds.push(parseInt(this.id));
			if ($("#ch" + this.id).children().length > 0) {
				$($("#ch" + this.id).find(".tab")).each(function() {
					bg.dt.tabsIds.push(parseInt(this.id));
				});
			}
		});
		bg.dt.CameFromWindowId = CurrentWindowId;
	});
	
	// SET DROP TARGET
	$(document).on("dragenter", ".drag_entered_top, .drag_entered_bottom, .drag_enter_center", function(event) {
		event.stopPropagation();
		if ($(".selected").find($(this)).length > 0) return;
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$(this).addClass("highlighted_drop_target");
	});

	$(document).on("dragenter", ".drag_enter_center", function(event) {
		timeout = false;
		setTimeout(function() { timeout = true; }, 1800);
	});
	$(document).on("dragleave", ".drag_enter_center", function(event) {
		timeout = false;
	});
	$(document).on("dragover", ".drag_enter_center", function(event) {
		if (timeout && bg.opt.open_tree_on_hover && $(this).parent().is(".c")) {
			$(this).parent().addClass("o").removeClass("c");
			timeout = false;
		}
	});


	$(document).on("dragend", ".tab_header", function(event) {
		if (bg.dt.CameFromWindowId == CurrentWindowId && bg.dt.DroppedToWindowId == 0) {
			DetachTabs(bg.dt.tabsIds);
		}

		if (bg.dt.CameFromWindowId == CurrentWindowId && bg.dt.DroppedToWindowId != CurrentWindowId && bg.dt.DroppedToWindowId != 0) {
			bg.tabs[bg.dt.tabsIds[0]].p = bg.dt.DropToTabId;
			bg.tabs[bg.dt.tabsIds[0]].n = bg.dt.DropToIndex;
			chrome.tabs.move(bg.dt.tabsIds, { windowId: bg.dt.DroppedToWindowId, index: -1 });
		}

		if (bg.dt.CameFromWindowId == CurrentWindowId && bg.dt.DroppedToWindowId == CurrentWindowId) {
			if ($(".highlighted_drop_target").parent().is(".pin")) {
				$(".selected").each(function() {
					SetTabClass({ id: this.id, pin: true });

					if ($(".highlighted_drop_target").is(".drag_entered_top")) {
						$(this).insertBefore($(".highlighted_drop_target").parent());
					} else {
						$(this).insertAfter($(".highlighted_drop_target").parent());
					}
				});
			}

			if ($(".highlighted_drop_target").parent().is(".tab")) {
				$(".selected").each(function() {
					SetTabClass({ id: this.id, pin: false });
				});
				if ($(".highlighted_drop_target").is(".drag_entered_top")) {
					$(".selected").insertBefore($(".highlighted_drop_target").parent());

				}
				if ($(".highlighted_drop_target").is(".drag_entered_bottom")) {
					$(".selected").insertAfter($(".highlighted_drop_target").parent());
				}
				if (($(".highlighted_drop_target").is(".drag_enter_center") && $("#" + DragNode.id).parent()[0].id != "ch" + $(".highlighted_drop_target")[0].id.substr(2))) {
					if (bg.opt.append_at_end) {
						$("#ch" + $(".highlighted_drop_target")[0].id.substr(2)).append($(".selected"));
					} else {
						$("#ch" + $(".highlighted_drop_target")[0].id.substr(2)).prepend($(".selected"));
					}
				}
			}
		}
		
		RefreshExpandStates();

		setTimeout(function() {
			timeout = false;
			DragNode = undefined;
			schedule_update_data++;
			DropTargetsSendToBack();
		}, 500);
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$(".tab_header_hover").removeClass("tab_header_hover");
		$(".frozen").addClass("selected").removeClass("frozen");
		$(".temporary").removeClass("selected").removeClass("temporary");
		chrome.runtime.sendMessage({command: "drag_end"});
	});


	$(document).on("click", ".exp_box", function(event) {
		event.stopPropagation();
		if (event.button == 0) {
			if ($(this).parent().parent().is(".o")) {
				$(this).parent().parent().removeClass("o").addClass("c");
				if (bg.tabs[$(this).parent().parent()[0].id]) {
					bg.tabs[$(this).parent().parent()[0].id].o = "c";
				}
			} else {
				if ($(this).parent().parent().is(".c")) {
					if (bg.opt.close_other_trees) {
						$(".o").removeClass("o").addClass("c");
						$(this).parents(".tab").each(function() {
							$(this).removeClass("n").removeClass("c").addClass("o");
							if (bg.tabs[this.id]) {
								bg.tabs[this.id].o = "o";
							}
						});
						$(".c").each(function() {
							if (bg.tabs[this.id]) {
								bg.tabs[this.id].o = "c";
							}
						});
					}
					$(this).parent().parent().removeClass("c").addClass("o");
					if (bg.tabs[$(this).parent().parent()[0].id]) {
						bg.tabs[$(this).parent().parent()[0].id].o = "o";
					}
				}
			}
			bg.schedule_save++;
		}
	});

	// SELECT OR CLOSE TAB/PIN
	$(document).on("mousedown", ".tab, .pin", function(event) {
		DropTargetsSendToBack();
		event.stopPropagation();
		if (event.button == 0) {

			// SET SELECTION WITH SHIFT
			if (event.shiftKey) {
				$(".pin, .tab").removeClass("selected").removeClass("frozen").removeClass("temporary");
				if ($(this).index() >= $(".active").index()) {
					$(".active").nextUntil($(this), ":visible").add($(".active")).add($(this)).addClass("selected");
				} else {
					$(".active").prevUntil($(this), ":visible").add($(".active")).add($(this)).addClass("selected");
				}
			}

			// TOGGLE SELECTION WITH CTRL
			if (event.ctrlKey) {
				$(this).toggleClass("selected");
			}
		}

		// CLOSE TAB
		if (
			(($(this).is(".tab") && $(event.target).is(":not(.expand)")) && ((event.button == 1 && bg.opt.close_with_MMB == true) || (event.button == 0 && $(event.target).is(".close, .close_img"))))
			||
			($(this).is(".pin") && event.button == 1 && bg.opt.close_with_MMB == true && bg.opt.allow_pin_close == true)
		) {
			if ($(this).is(".active") && bg.opt.after_closing_active_tab != "browser") {
				var tabId;
				var Prev = $(this).prev();
				var Next = $(this).next();

				// if in root, seek for closest, in order set in options, first next then prev, or prev then next
				if ($(this).parent().is("#pin_list, #tab_list, .children")) {
					if (bg.opt.after_closing_active_tab == "above") {
						if (Prev[0]) {
							tabId = Prev[0].id;
						} else {
							if (Next[0]) {
								tabId = Next[0].id;
							}
						}
					}
					if (bg.opt.after_closing_active_tab == "below") {
						if (Next[0]) {
							tabId = Next[0].id;
						} else {
							if (Prev[0]) {
								tabId = Prev[0].id;
							}
						}
					}
				}

				// if no tabs left in the tree, go to parent
				if (tabId == undefined && $(this).parent().parent().is(".tab")) {
					tabId = $(this).parent().parent()[0].id;
				}

				// if found a matching condition a new tab will be activated
				if (tabId) {
					SetActiveTab(tabId);
					chrome.tabs.update(parseInt(tabId), { active: true });
				}

			}

			if ($("#" + this.id).is(".pin")) {
				$("#" + this.id).remove();
				chrome.tabs.update(parseInt(this.id), { pinned: false });
			}

			chrome.tabs.remove(parseInt(this.id));
		}
	});

	// single click to activate tab
	$(document).on("click", ".tab_header", function(event) {
		event.stopPropagation();
		if (!event.shiftKey && !event.ctrlKey && $(event.target).is(":not(.close, .close_img, .expand, .tab_mediaicon)")) {
			SetActiveTab($(this).parent()[0].id);
			chrome.tabs.update(parseInt($(this).parent()[0].id), { active: true });
		}
	});


	// set bg.dt to detach tabs when drag ends outside the window
	$(document).on("dragleave", "body", function(event) {
		bg.dt.DroppedToWindowId = 0;
	});
	// set bg.dt to attach tabs when drag ends inside the window
	$(document).on("dragover", "*", function(event) {
		bg.dt.DroppedToWindowId = CurrentWindowId;
	});
	$(document).on("drag", ".tab_header", function(event) {
		event.stopPropagation();
		bg.dt.DroppedToWindowId = CurrentWindowId;
	});
	$(document).on("drop", "#pin_list, #tab_list", function(event) {
		bg.dt.DroppedToWindowId = CurrentWindowId;
	});

	// set bg.dt to attach tabs and append them to tabId
	$(document).on("drop", ".drag_enter_center", function(event) {
		event.stopPropagation();
		bg.dt.DroppedToWindowId = CurrentWindowId;
		bg.dt.DropToTabId = $(this).parent()[0].id;
	});

	// set bg.dt to attach tabs and move them above or below highligted tab
	$(document).on("drop", ".drag_entered_top, .drag_entered_bottom", function(event) {
		event.stopPropagation();
		bg.dt.DroppedToWindowId = CurrentWindowId;
		if ($(this).parent().parent().is("#tab_list, #pin_list")){
			bg.dt.DropToTabId = $(this).parent().parent()[0].id;
		} else {
			bg.dt.DropToTabId = $(this).parent().parent().parent()[0].id;
		}

		bg.dt.DropToIndex = $(this).parent().index();
		bg.dt.DropAfter = $(this).is(".drag_entered_bottom") ? true : false;
	});

}