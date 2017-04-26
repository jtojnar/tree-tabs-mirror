// **********         GLOBAL VARIABLES          ***************

var bg;
if (navigator.userAgent.match("Firefox") !== null){
	bg = browser.extension.getBackgroundPage();
} else {
	bg = chrome.extension.getBackgroundPage();
}

var DragNode;
var timeout = false;
var menuTabId = 0;
var CurrentWindowId = 0;
var SearchIndex = 0;
var schedule_update_data = 0;
// pressing keys
var IOKeys = {MouseHoverOver: "", LMB: false, Ctrl: false, Shift: false, a: false, i: false};
