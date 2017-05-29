// **********         CHROME EVENTS         ***************

chrome.commands.onCommand.addListener(function(command) {
	chrome.windows.getLastFocused({windowTypes: ["normal"]}, function(window) {
		if (CurrentWindowId == window.id){
			if (command == "goto_tab_above"){
				ActivatePrevTab();
			}
			if (command == "goto_tab_below"){
				ActivateNextTab();
			}
		}
	});
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	if (message.command == "reload"){
		window.location.reload();
	}
	if (message.command == "recheck_tabs"){
		schedule_update_data++;
	}
	if (message.command == "drag_end"){
		DropTargetsSendToBack();
	}


	if (message.windowId == CurrentWindowId){
		switch(message.command){
			case "tab_created":
			
				// if set to treat unparented tabs as active tab's child
				if (bg.opt.append_orphan_tab == "as_child" && message.tab.openerTabId == undefined){
					message.tab.openerTabId = $(".active")[0].id;
				}
				// child case
				if (message.tab.openerTabId){
					
					// append to tree
					if (bg.opt.max_tree_depth < 0 || (bg.opt.max_tree_depth > 0 && $("#"+message.tab.openerTabId).parents(".tab").length < bg.opt.max_tree_depth)){
						if (bg.opt.append_child_tab == "top"){
							AppendTab({ tab: message.tab, ParentId: message.tab.openerTabId, Append: false });
						}
						if (bg.opt.append_child_tab == "bottom"){
							AppendTab({ tab: message.tab, ParentId: message.tab.openerTabId, Append: true });
						}
					}
					
					// if reached depth limit of the tree
					if (bg.opt.max_tree_depth > 0 && $("#"+message.tab.openerTabId).parents(".tab").length >= bg.opt.max_tree_depth){
						if (bg.opt.append_child_tab_after_limit == "after"){
							AppendTab({ tab: message.tab, InsertAfterId: message.tab.openerTabId, Append: true });
						}
						if (bg.opt.append_child_tab_after_limit == "top"){
							AppendTab({ tab: message.tab, ParentId: $("#"+message.tab.openerTabId).parent().parent()[0].id, Append: false });
						}
						if (bg.opt.append_child_tab_after_limit == "bottom"){
							AppendTab({ tab: message.tab, ParentId: $("#"+message.tab.openerTabId).parent().parent()[0].id, Append: true });
						}
					}

					// place tabs flat, (should I merge it with orphans case?)
					if (bg.opt.max_tree_depth == 0){
						if (bg.opt.append_child_tab_after_limit == "after"){
							AppendTab({ tab: message.tab, InsertAfterId: message.tab.openerTabId, Append: false });
						}
						if (bg.opt.append_child_tab_after_limit == "top"){
							AppendTab({ tab: message.tab, Append: false });
						}
						if (bg.opt.append_child_tab_after_limit == "bottom"){
							AppendTab({ tab: message.tab, Append: true });
						}
					}
				// orphan case
				} else {
					if (bg.opt.append_orphan_tab == "after_active"){
						AppendTab({ tab: message.tab, InsertAfterId: $(".active")[0].id, Append: false });
					}
					if (bg.opt.append_orphan_tab == "top"){
						AppendTab({ tab: message.tab, Append: false });
					}
					if (bg.opt.append_orphan_tab == "bottom"){
						AppendTab({ tab: message.tab, Append: true });
					}
				}
				if ($("#"+message.tab.openerTabId).is(".c")){
					$("#"+message.tab.openerTabId).removeClass("c").addClass("o");
				}
				RefreshExpandStates();
				schedule_update_data++;
				RefreshGUI();
			break;
			case "tab_attached":
				AppendTab({ tab: message.tab, ParentId: bg.tabs[message.tabId].p, Append: true});
				if ($("#"+message.tabId).parent().children().eq(bg.dt.DropToIndex)){
					if (bg.dt.DropAfter){
						$("#"+message.tabId).insertAfter($("#"+message.tabId).parent().children().eq(bg.dt.DropToIndex));
					} else {
						$("#"+message.tabId).insertBefore($("#"+message.tabId).parent().children().eq(bg.dt.DropToIndex));
					}
				}
				RefreshExpandStates();
				setTimeout(function(){
					DropTargetsSendToBack();
					schedule_update_data++;
				},300);
				RefreshGUI();
			break;
			case "tab_removed":
				if (bg.opt.promote_children && $("#"+message.tabId).is(".tab")){
					$("#ch"+message.tabId).children().insertAfter($("#"+message.tabId));
				} else {
					$("#"+message.tabId).find(".tab").each(function(){
						chrome.tabs.remove(parseInt(this.id));
					});
				}
				RemoveTabFromList(message.tabId);
				RefreshExpandStates();
				setTimeout(function(){ schedule_update_data++; },300);
				RefreshGUI();
			break;
			case "tab_activated":
				setTimeout(function(){ SetActiveTab(message.tabId); },100);
			break;
			case "tab_updated":
				if (message.changeInfo.favIconUrl != undefined || message.changeInfo.url != undefined){
					setTimeout(function(){ GetFaviconAndTitle(message.tabId); },100);
				}
				if (message.changeInfo.title != undefined){
					setTimeout(function(){ GetFaviconAndTitle(message.tabId); },1000);
				}
				
				if (message.changeInfo.audible != undefined || message.changeInfo.mutedInfo != undefined){
					RefreshMediaIcon(message.tabId);
				}
				if (message.changeInfo.discarded != undefined){
					RefreshDiscarded(message.tabId);
				}
				if (message.changeInfo.pinned != undefined && DragNode == undefined){
					if ((message.tab.pinned && $("#"+message.tabId).is(".tab")) || (!message.tab.pinned && $("#"+message.tabId).is(".pin"))){
						SetTabClass({ id: message.tabId, pin: message.tab.pinned });
						schedule_update_data++;
					}
					RefreshExpandStates();
				}
			break;
		}
	}
	
});