// **********         GLOBAL VARIABLES          ***************

var bg;
if (navigator.userAgent.match("Firefox") !== null){
	bg = browser.extension.getBackgroundPage();
} else {
	bg = chrome.extension.getBackgroundPage();
}

var MouseHoverOver = "";
var DragNode;
var DropTargetsInFront = false;
var timeout = false;
var menuTabId = 0;
var CurrentWindowId = 0;
var SearchIndex = 0;
var schedule_update_data = 0;
