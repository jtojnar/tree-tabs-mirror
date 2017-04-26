// **********          REFRESH GUI          ***************

function SetTRefreshEvents(){
	$(window).on('resize', function(event){
		RefreshGUI();
	});

	// click on media icon
	$(document).on("mousedown", ".tab_mediaicon", function(event){
		event.stopPropagation();
		if (event.button == 0 && $(this).parent().parent().is('.audible, .muted')){
			chrome.tabs.get(parseInt(this.parentNode.parentNode.id), function(tab){
				chrome.tabs.update(tab.id, {muted:!tab.mutedInfo.muted});
			});
		}
	});
}