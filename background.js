var opt = { 
	"skip_load": false, "new_open_below": false, "pin_list_multi_row": false, "close_with_MMB": true,
	"always_show_close": false, "allow_pin_close": false,
	"append_child_tab": "bottom", "append_child_tab_after_limit": "after",
	"append_orphan_tab": "bottom", "after_closing_active_tab": "below", "close_other_trees": false,
	"promote_children": true, "open_tree_on_hover": true, "max_tree_depth": -1, "never_show_close": false, "faster_scroll": false
};
var opt_toolbar = {
	"active_toolbar_tool": "", "filter_type": "url"
};

var	hold = true,
	started = false,
	schedule_save = 0,

	tabs = {},

	dt = {tabsIds: [], DropAfter: true, DropToTabId: 0, DropToIndex: 0, CameFromWindowId: 0, DroppedToWindowId: 0},
	
	caption_clear_filter = chrome.i18n.getMessage("caption_clear_filter"),
	caption_loading = chrome.i18n.getMessage("caption_loading"),
	caption_searchbox = chrome.i18n.getMessage("caption_searchbox");
	
function Start(){
	started = true;

	// open options to set defaults
	if (localStorage.getItem("themeDefault") === null){
		chrome.tabs.create({url: "options.html" });
	}

	// all variables needed to load data
	var	loaded_options = {}, loaded_opt_toolbar = {};
	
	// set loaded options
	if (localStorage.getItem("current_options") !== null){
		loaded_options = JSON.parse(localStorage["current_options"]);
	}
	for (var parameter in opt) {
		if (loaded_options[parameter] != undefined && opt[parameter] != undefined){
			opt[parameter] = loaded_options[parameter];
		}
	}

	// toolbar shelfs options (search url-title and which shelf is active)
	if (localStorage.getItem("current_toolbar_options") !== null){
		loaded_opt_toolbar = JSON.parse(localStorage["current_toolbar_options"]);
	}
	for (var parameter in opt_toolbar) {
		if (loaded_opt_toolbar[parameter] != undefined && opt_toolbar[parameter] != undefined){
			opt_toolbar[parameter] = loaded_opt_toolbar[parameter];
		}
	}


	LoadTabs(0);
}	
	
	
	
function LoadTabs(retry){
	chrome.tabs.query({windowType: "normal"}, function(qtabs){
		
		// will loop forever if session restore tab is found
		if (navigator.userAgent.match("Firefox") !== null){
			var halt = false;
			for (var t = 0; t < qtabs.length; t++){
				if (qtabs[t].url.match("sessionrestore")){
					halt = true;
					chrome.tabs.update(qtabs[t].id, { active: true });
					break;
				}
			}
			if (halt){
				setTimeout(function(){
					LoadTabs(retry);
				}, 2000);
				return;
			}
		}

		// create current tabs object
		qtabs.forEach(function(Tab){
			HashTab(Tab);
		});
		
		var reference_tabs = {};
		var tabs_matched = 0;
		
		// compare saved tabs from storage to current session tabs, but can be skipped if set in options
		if (opt.skip_load == false){
			qtabs.forEach(function(Tab){
				for (var t = 0; t < 9999; t++){
					if (localStorage.getItem("t"+t) !== null){
						var LoadedTab = JSON.parse(localStorage["t"+t]);
						if (LoadedTab[1] === tabs[Tab.id].h && reference_tabs[LoadedTab[0]] == undefined){
							reference_tabs[LoadedTab[0]] = Tab.id;
							tabs[Tab.id].p = LoadedTab[2];
							tabs[Tab.id].n = LoadedTab[3];
							tabs[Tab.id].o = LoadedTab[4];
							tabs_matched++;
							break;
						}
						
					} else {
						break;
					}

				}
			});
			
			// replace parents tabIds to new ones, for that purpose reference_tabs was made before
			for (var tabId in tabs){
				if (reference_tabs[tabs[tabId].p] != undefined){
					tabs[tabId].p = reference_tabs[tabs[tabId].p];
				}
			}
		}


		// will try to find tabs for 10 times, roughly 30 seconds
		if (opt.skip_load == true || retry > 10 || localStorage.getItem("t0") === null || localStorage.getItem("t_count") === null || (tabs_matched > JSON.parse(localStorage["t_count"]))){
			hold = false;
			StartChromeListeners();
			PeriodicCheck();
			AutoSaveData();
		} else {
			setTimeout(function(){
				LoadTabs(retry+1);
			}, 3000);
		}
	});
}

// once a minute checking for missing tabs
function PeriodicCheck(){
	setTimeout(function(){
		PeriodicCheck();
		if (!hold){
			chrome.tabs.query({windowType: "normal"}, function(qtabs){
				qtabs.forEach(function(Tab){
					if (tabs[Tab.id] == undefined){
						HashTab(Tab);
						setTimeout(function(){
							chrome.runtime.sendMessage({command: "recheck_tabs"});
						},300);
						setTimeout(function(){
							schedule_save++;
						},600);
					}
				});
			});
		}
	},60000);
}

// save every 2 seconds if there is anything to save obviously
function AutoSaveData(){
	setTimeout(function(){
		AutoSaveData();
		if (schedule_save > 0){
			schedule_save = 1;
		}
		if (!hold && schedule_save > 0 && Object.keys(tabs).length > 1){
			chrome.tabs.query({windowType: "normal"}, function(qtabs){
				localStorage["t_count"] = qtabs.length*0.5;
				for (var t = 0; t < qtabs.length; t++){
					if (tabs[qtabs[t].id] != undefined && tabs[qtabs[t].id].h != undefined && tabs[qtabs[t].id].p != undefined && tabs[qtabs[t].id].n != undefined && tabs[qtabs[t].id].o != undefined){
						var Tab = JSON.stringify([qtabs[t].id, tabs[qtabs[t].id].h, tabs[qtabs[t].id].p, tabs[qtabs[t].id].n, tabs[qtabs[t].id].o]);
						if (localStorage.getItem("t"+t) == null || localStorage["t"+t] !== Tab){
							localStorage["t"+t] = Tab;
						}
					}
				}
				schedule_save--;
			});
		}
	}, 1000);
}

function SaveOptions(){
	localStorage["current_options"] = JSON.stringify(opt);
}
function SaveToolbarOptions(){
	localStorage["current_toolbar_options"] = JSON.stringify(opt_toolbar);
}

function HashTab(tab){
	if (tabs[tab.id] == undefined){
		tabs[tab.id] = {h: 0, p: tab.pinned ? "pin_list" : "tab_list", n: tab.index, o: "n"};
	}
	var hash = 0;
	if (tab.url.length === 0){
		return 0;
	}
	for (var i = 0; i < tab.url.length; i++){
		hash = (hash << 5)-hash;
		hash = hash+tab.url.charCodeAt(i);
		hash |= 0;
	}
	tabs[tab.id].h = hash;
}

// start all listeners
function StartChromeListeners(){
	chrome.tabs.onCreated.addListener(function(tab){
		HashTab(tab);
		chrome.runtime.sendMessage({command: "tab_created", windowId: tab.windowId, tab: tab, tabId: tab.id});
		schedule_save++;
	});
	chrome.tabs.onAttached.addListener(function(tabId, attachInfo){
		chrome.tabs.get(tabId, function(tab){
			if (tabs[tabId] == undefined){ HashTab(tab); }
			chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tabId});
		});
		schedule_save++;
	});
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
		chrome.runtime.sendMessage({command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId});
		delete tabs[tabId];
		schedule_save++;
	});
	chrome.tabs.onDetached.addListener(function(tabId, detachInfo){
		if (tabs[tabId] == undefined){ HashTab(tab); }
		chrome.runtime.sendMessage({command: "tab_removed", windowId: detachInfo.oldWindowId, tabId: tabId});
		schedule_save++;
	});
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
		if (tabs[tabId] == undefined || changeInfo.url != undefined){ HashTab(tab); }
		if (changeInfo.pinned == true){ tabs[tabId].p = "pin_list"; }
		if (changeInfo.pinned == false){ tabs[tabId].p = "tab_list"; }
		chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tabId, changeInfo: changeInfo});
		if (changeInfo.url != undefined || changeInfo.pinned != undefined){schedule_save++;}
	});
	chrome.tabs.onMoved.addListener(function(tabId, moveInfo){
		if (tabs[tabId] == undefined){ HashTab(tab); }
		chrome.runtime.sendMessage({command: "tab_moved", windowId: moveInfo.windowId, tabId: tabId, moveInfo: moveInfo});
		schedule_save++;
	});
	chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId){
		chrome.tabs.get(addedTabId, function(tab){
			if (addedTabId == removedTabId){
				chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tab.id, changeInfo: {status: tab.status, url: tab.url, title: tab.title, audible: tab.audible, mutedInfo: tab.mutedInfo}});
			} else {
				if (tabs[removedTabId]){
					tabs[addedTabId] = {h: GetHash(tab.url), p: tabs[removedTabId].p, n: tabs[removedTabId].n, o: tabs[removedTabId].o};
				} else {
					HashTab(tab);
				}
				chrome.runtime.sendMessage({command: "tab_removed", windowId: tab.windowId, tabId: removedTabId});
				chrome.runtime.sendMessage({command: "tab_attached", windowId: tab.windowId, tab: tab, tabId: addedTabId});
				delete tabs[removedTabId];
			}
			schedule_save++;
		});
	});
	chrome.tabs.onActivated.addListener(function(activeInfo){
		chrome.runtime.sendMessage({command: "tab_activated", windowId: activeInfo.windowId, tabId: activeInfo.tabId});
	});
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	switch(message.command){
		case "background_start":
			if (!started){
				Start();
			}
		break;
		case "reload":
			window.location.reload();
		break;
		case "options_save":
			SaveOptions();
		break;
		case "toolbar_options_save":
			SaveToolbarOptions();
		break;
	}
});
function log(m){
	console.log(m);
}
chrome.runtime.onStartup.addListener(function(){
	Start();
});

if (navigator.userAgent.match("Firefox") === null){
	chrome.runtime.onSuspend.addListener(function(){
		hold = true;
	});
}

