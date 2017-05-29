// **********      OPTIONS       ***************

var bg;
if (navigator.userAgent.match("Firefox") !== null){
	bg = browser.extension.getBackgroundPage();
} else {
	bg = chrome.extension.getBackgroundPage();
}

var themes = [];
var theme = {};

document.addEventListener("DOMContentLoaded", function(){
	document.title = "Tree Tabs";

	if (bg.opt == undefined){
		setTimeout(function(){
			location.reload();
		}, 3000);
	}

	if (localStorage.getItem("themes") != null){
		themes = JSON.parse(localStorage["themes"]);
	}
	if (localStorage.getItem("current_theme") != null){
		LoadTheme(localStorage["current_theme"]);
	}

	GetOptions();
	RefreshFields();
	SetEvents();	
});


// AppendCSSSheets from theme
function AppendCSSSheets(theme){
	var css_variables = "";
	for (var css_variable in theme.TabsSizeSet){
		css_variables = css_variables + "--" + css_variable + ":" + theme.TabsSizeSet[css_variable] + ";";
	}
	
	for (var css_variable in theme.ColorsSet){
		ColorsSet[css_variable] = theme.ColorsSet[css_variable];
		if ($("#"+css_variable)[0]) $("#"+css_variable)[0].value = theme.ColorsSet[css_variable];
		css_variables = css_variables + "--" + css_variable + ":" + theme.ColorsSet[css_variable] + ";";
	}
	
	// remove previous css rules in css sheet 0
	for (var r = 0; r < document.styleSheets[0].cssRules.length; r++){
		if (document.styleSheets[0].cssRules[r].cssText.match("--pin_width") !== null){
			document.styleSheets[0].deleteRule(r);
		}
		if (document.styleSheets[0].cssRules[r].cssText.match("::-webkit-scrollbar") !== null){
			document.styleSheets[0].deleteRule(r);
		}
	}
	document.styleSheets[0].insertRule("body { "+css_variables+" }", 0);
	
	// scrollbars
	if (navigator.userAgent.match("Firefox") === null){
		document.styleSheets[0].insertRule("::-webkit-scrollbar { width:"+theme.ScrollbarTabList+"px; height:"+theme.ScrollbarPinList+"px; }", 3);
	}
}

function LoadTheme(themeName){
	var theme = JSON.parse(localStorage["theme"+themeName]);

	TabsSizeSet = theme.TabsSizeSetNumber;

	// append toolbar from theme
	$("#toolbar").html(theme.toolbar);

	AppendCSSSheets(theme);
	
	$("#button_filter_type").addClass("url").removeClass("title");

	// expand toolbar options
	ToolbarShow = $("#show_toolbar")[0].checked = theme.ToolbarShow;
	$("#field_show_toolbar").css({"height": $("#show_toolbar")[0].checked ? "" : "6"});
	ToolbarShow ? $("#options_available_buttons, #toolbar, #toolbar_colors").show() : $("#options_available_buttons, #toolbar, #toolbar_colors").hide();
	
	// append example tabs
	$("#pin_list, #tab_list").html("");
	// pins
	AppendTab({tab: {id: "p0", pinned: true}, Append: true});
	AppendTab({tab: {id: "p1", pinned: true, active: true}, Append: true});
	
	// tabs
	AppendTab({tab: {id: "t2", pinned: false}, Append: true});
	$("#tab_titlet2")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal");

	AppendTab({tab: {id: "t3", pinned: false, active: true}, Append: true, ParentId: "t2"});
	$("#tab_titlet3")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected");
	$(".tab#t3").addClass("c selected");
	

	AppendTab({tab: {id: "t5", pinned: false, discarded: true}, Append: true});
	$("#tab_titlet5")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded");

	AppendTab({tab: {id: "t6", pinned: false}, Append: true});
	$("#tab_titlet6")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result");
	$(".tab#t6").addClass("filtered");
	

	AppendTab({tab: {id: "t7", pinned: false}, Append: true});
	$("#tab_titlet7")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_higlighted");
	$(".tab#t7").addClass("filtered highlighted_search");


	AppendTab({tab: {id: "t8", pinned: false}, Append: true});
	$("#tab_titlet8")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected");
	$(".tab#t8").addClass("selected filtered");
	
	
	
	AppendTab({tab: {id: "t9", pinned: false}, Append: true});
	$("#tab_titlet9")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active");
	$(".tab#t9").addClass("active selected filtered");
	
	// drag&drop indicator
	$(".drag_entered_bottom").first().addClass("highlighted_drop_target");

	// toolbar events
	$("#toolbar_tools, #toolbar_search").addClass("hidden");
	$(".on").removeClass("on");

	ScrollbarPinList = $("#scrollbar_pin_list")[0].value = theme.ScrollbarPinList;
	ScrollbarTabList = $("#scrollbar_tab_list")[0].value = theme.ScrollbarTabList;

	$("#active_tab_font_bold")[0].checked = theme.ColorsSet.active_font_weight == "normal" ? false : true;
	$("#body").css({"background-color": "transparent"});

}


// document events
function GetOptions(){
	// get language labels
	$(".label").each(function(){
		$(this).text(chrome.i18n.getMessage(this.id));
	});
	// get language for color pick labels
	$(".cpl").each(function(){
		$(this).text(chrome.i18n.getMessage(this.id));
	});
	// get language for menu labels
	$(".menu_item").each(function(){
		$(this).text(chrome.i18n.getMessage("options_example_menu_item"));
	});
	
	// get checkboxes from saved states
	$(".opt_checkbox").each(function(){
		$(this)[0].checked = bg.opt[this.id];
	});
	$(".set_button").each(function(){
		$(this)[0].textContent = chrome.i18n.getMessage(this.id);
	});
	
	// get language dropdown menus
	$(".bg_opt_drop_down_menu").each(function(){
		$(this)[0].textContent = chrome.i18n.getMessage(this.id);
	});

	
	// get options for append child tab
	for (var i = 0; i < $("#append_child_tab")[0].options.length; i++){
		if ($("#append_child_tab")[0].options[i].value === bg.opt.append_child_tab){
			$("#append_child_tab")[0].selectedIndex = i;
			break;
		}
	}

	// get options for append child tab after limit
	for (var i = 0; i < $("#append_child_tab_after_limit")[0].options.length; i++){
		if ($("#append_child_tab_after_limit")[0].options[i].value === bg.opt.append_child_tab_after_limit){
			$("#append_child_tab_after_limit")[0].selectedIndex = i;
			break;
		}
	}
	
	// get options for append orphan tab
	for (var i = 0; i < $("#append_orphan_tab")[0].options.length; i++){
		if ($("#append_orphan_tab")[0].options[i].value === bg.opt.append_orphan_tab){
			$("#append_orphan_tab")[0].selectedIndex = i;
			break;
		}
	}
	
	// get options for action after closing active tab
	for (var i = 0; i < $("#after_closing_active_tab")[0].options.length; i++){
		if ($("#after_closing_active_tab")[0].options[i].value === bg.opt.after_closing_active_tab){
			$("#after_closing_active_tab")[0].selectedIndex = i;
			break;
		}
	}

	// get options for tabs tree depth option
	$("#max_tree_depth")[0].value = bg.opt.max_tree_depth;

	// append themes to dropdown menu
	for (var i = 0; i < themes.length; i++){
		var t_list = document.getElementById("theme_list");
		var	theme_name = document.createElement("option");
			theme_name.value = themes[i];
			theme_name.text = themes[i];
		t_list.add(theme_name);
	}
	
	// select current theme in dropdown list
	for (var i = 0; i < $("#theme_list")[0].options.length; i++){
		if ($("#theme_list")[0].options[i].value === localStorage["current_theme"]){
			$("#theme_list")[0].selectedIndex = i;
			break;
		}
	}
}


function ExportTheme(filename) {
	var themeObj = {
		"ToolbarShow": ToolbarShow,
		"ColorsSet": ColorsSet,
		"TabsSizeSetNumber": TabsSizeSet,
		"TabsSizeSet": TabsSizeSets[TabsSizeSet],
		"ScrollbarPinList": ScrollbarPinList,
		"ScrollbarTabList": ScrollbarTabList,
		"theme_name": $("#theme_list").val(),
		"theme_version": CurrentThemeVersion,
		"toolbar": ToolbarSet
	};
	var data = JSON.stringify(themeObj);
	var body = document.getElementById("body");
	var link = document.createElement("a");
	link.target = "_blank";
	link.download = filename;
	link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
	body.appendChild(link);
	link.click();
	link.remove();
}


function ImportTheme(){
	var file = document.getElementById("import_theme");
	var fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[0]);
	fr.onload = function(){
		var data = fr.result;
		var themeObj = JSON.parse(data);

		if (themeObj.theme_version > CurrentThemeVersion){
			alert(chrome.i18n.getMessage("options_loaded_theme_newer_version"));
		}
		if (themeObj.theme_version < CurrentThemeVersion){
			alert(chrome.i18n.getMessage("options_loaded_theme_older_version"));
		}
		
		if (themeObj.theme_version <= CurrentThemeVersion){
			for (var val in ColorsSet){
				ColorsSet[val] = themeObj.ColorsSet[val];
			}
			
			ToolbarShow = themeObj.ToolbarShow;
			TabsSizeSet = themeObj.TabsSizeSetNumber;
			ScrollbarPinList = themeObj.ScrollbarPinList;
			ScrollbarTabList = themeObj.ScrollbarTabList;

			$("#toolbar").html(themeObj.toolbar);
			ToolbarSet = themeObj.toolbar;

			if (themes.indexOf(themeObj.theme_name) != -1){
				themeObj.theme_name = themeObj.theme_name + "(1)";
			}
			
			themes.push(themeObj.theme_name);
		
			SaveTheme(themeObj.theme_name);
			var t_list = document.getElementById("theme_list");
			var	theme_name = document.createElement("option");
				theme_name.value = themeObj.theme_name;
				theme_name.text = theme_name.value;
			t_list.add(theme_name);
			
			$("#theme_list")[0].selectedIndex = $("#theme_list")[0].options.length-1;
			
			localStorage["themes"] = JSON.stringify(themes);
			localStorage["current_theme"] = themeObj.theme_name;
			LoadTheme(themeObj.theme_name);
			RefreshFields();
		}
	}	 

}



// document events
function SetEvents(){

	// import theme preset button
	$(document).on("click", "#options_import_theme_button", function(event){
		$("#import_theme").click();
	});
	$(document).on("change", "#import_theme", function(event){
		ImportTheme();
	});
	
	// export theme preset button
	$(document).on("click", "#options_export_theme_button", function(event){
		if ($("#theme_list")[0].options.length == 0){
			alert(chrome.i18n.getMessage("options_no_theme_to_export"));
		} else {
			ExportTheme($("#theme_list").val() + ".tt_theme");
		}
	});


	// rename theme preset button
	$(document).on("click", "#options_rename_theme_button", function(event){
		
		if (themes.indexOf($("#new_theme_name")[0].value) != -1){
			alert(chrome.i18n.getMessage("options_there_is_a_theme_with_this_name"));
			return;
		}
		
		if ($("#new_theme_name")[0].value == ""){
			alert(chrome.i18n.getMessage("options_theme_name_cannot_be_empty"));
			return;
		}

		
		localStorage["theme"+($("#new_theme_name")[0].value)] = localStorage["theme"+($("#theme_list").val())];
		localStorage.removeItem("theme"+($("#theme_list").val()));

		var t_list = document.getElementById("theme_list");
		
		themes[themes.indexOf(t_list.options[t_list.selectedIndex].value)] = $("#new_theme_name")[0].value;
		t_list.options[t_list.selectedIndex].value = t_list.options[t_list.selectedIndex].text = $("#new_theme_name")[0].value;
		localStorage["themes"] = JSON.stringify(themes);
		localStorage["current_theme"] = $("#theme_list").val();
	});



	// set checkbox options on/off and save
	$(document).on("click", ".bg_opt", function(event){
		bg.opt[this.id] = $(this)[0].checked ? true : false;
		chrome.runtime.sendMessage({command: "options_save"});
	});

	// set dropdown menu options
	$("#append_child_tab, #append_child_tab_after_limit, #after_closing_active_tab, #append_orphan_tab").change(function(){
		bg.opt[this.id] = $(this).val();
		chrome.runtime.sendMessage({command: "options_save"});
	});

	
	// set tabs tree depth option
	$(document).on("input", "#max_tree_depth", function(event){
		bg.opt.max_tree_depth = $(this)[0].value;
		chrome.runtime.sendMessage({command: "options_save"});
	});

	
	// set toolbar on/off and show/hide all toolbar options
	$(document).on("click", "#show_toolbar", function(event){
		ToolbarShow = $("#show_toolbar")[0].checked ? true : false;
		SaveTheme($("#theme_list").val());
		$("#field_show_toolbar").css({"height": $("#show_toolbar")[0].checked ? "" : "6"});
		ToolbarShow ? $("#options_available_buttons, #toolbar, #toolbar_colors").show() : $("#options_available_buttons, #toolbar, #toolbar_colors").hide();
	});


	// block system dragging
	$(document).bind("drop dragover", function(event){
		event.preventDefault();
	});

	var dragged_button;
	$(document).on("mousedown", ".button", function(event){
		if ($(this).is("#button_filter_type, #filter_search_go_prev, #filter_search_go_next")){
			return;
		}
		$(this).attr("draggable", "true");
		dragged_button = this;
	});

	// set dragged button node
	$(document).on("dragstart", ".button", function(event){
		event.originalEvent.dataTransfer.setData(" "," ");
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
	});
	
	// remove draggable attribute to clean html which will be saved in the toolbar
	$(document).on("mouseleave", ".button", function(event){
		$(".button").removeAttr("draggable");
	});
	
	// save toolbar
	$(document).on("dragend", ".button", function(event){
		ToolbarSet = $("#toolbar").html();
		SaveTheme($("#theme_list").val());
	});


	// drag&drop buttons to lists
	$(document).on("dragenter", "#toolbar_main, #toolbar_tools, #toolbar_unused_buttons", function(event){
		if ($(dragged_button).is("#button_tools, #button_search") && $(this).is("#toolbar_tools")){
			return;
		}
		if (dragged_button.parentNode.id != this.id){
			$("#"+dragged_button.id).appendTo($(this));
		}
	});

	// move (flip) buttons
	$(document).on("dragenter", ".button", function(event){
		if ($(dragged_button).is("#button_tools, #button_search") && $(this).parent().is("#toolbar_tools")){
			return;
		}
		if ($(this).parent().is("#toolbar_search, #toolbar_search_buttons")){
			return;
		}
		if ( $(this).index() <= $("#"+dragged_button.id).index()){
			$("#"+dragged_button.id).insertBefore($(this));
		} else {
			$("#"+dragged_button.id).insertAfter($(this));
		}
	});
	
	// add new theme preset button
	$(document).on("click", "#options_add_theme_button", function(event){
		if (themes.indexOf($("#new_theme_name")[0].value) != -1){
			alert(chrome.i18n.getMessage("options_there_is_a_theme_with_this_name"));
			return;
		}
		
		if ($("#new_theme_name")[0].value == ""){
			alert(chrome.i18n.getMessage("options_theme_name_cannot_be_empty"));
			return;
		}
		
		LoadTheme("Default");
		themes.push($("#new_theme_name")[0].value);
		var t_list = document.getElementById("theme_list");
		var	theme_name = document.createElement("option");
			theme_name.value = $("#new_theme_name")[0].value;
			theme_name.text = theme_name.value;
		t_list.add(theme_name);
		
		$("#theme_list")[0].selectedIndex = $("#theme_list")[0].options.length-1;
		SaveTheme(theme_name.value);
		localStorage["themes"] = JSON.stringify(themes);
		localStorage["current_theme"] = $("#theme_list").val();
		RefreshFields();
	});

	// remove theme preset button
	$(document).on("click", "#options_remove_theme_button", function(event){
		if ($("#theme_list")[0].options.length == 0){
			localStorage["current_theme"] = "Default";
			return;
		}

		themes.splice(themes.indexOf($("#theme_list").val()), 1);
		localStorage["themes"] = JSON.stringify(themes);

		localStorage.removeItem("theme"+($("#theme_list").val()));
		var x = document.getElementById("theme_list");
		x.remove(x.selectedIndex);

		localStorage["current_theme"] = ($("#theme_list")[0].options.length > 0) ? $("#theme_list").val() : "Default";
		LoadTheme(localStorage["current_theme"]);
		RefreshFields();
	});

	// select theme from list
	$("#theme_list").change(function(){
		localStorage["current_theme"] = $(this).val();
		LoadTheme($(this).val());
	});

		
	// change colors with color pickers
	$(document).on("input", ".cp", function(event){
		ColorsSet[this.id] = $(this)[0].value;
		AppendCSSSheets(SaveTheme($("#theme_list").val()));
	});

	// set scrollbar sizes
	$(document).on("input", "#scrollbar_pin_list, #scrollbar_tab_list", function(event){
		ScrollbarPinList = $("#scrollbar_pin_list")[0].value;
		ScrollbarTabList = $("#scrollbar_tab_list")[0].value;
		SaveTheme($("#theme_list").val());
		document.styleSheets[0].addRule("::-webkit-scrollbar", "width:"+ScrollbarTabList+"px; height:"+ScrollbarPinList+"px;");
	});
	
	
	// change tabs size preset(up)
	$(document).on("click", "#options_tabs_size_up", function(event){
		if (TabsSizeSet < TabsSizeSets.length-1){
			TabsSizeSet++;
			AppendCSSSheets(SaveTheme($("#theme_list").val()));
		}
	});

	// change tabs size preset(down)
	$(document).on("click", "#options_tabs_size_down", function(event){
		if (TabsSizeSet > 0){
			TabsSizeSet--;
			AppendCSSSheets(SaveTheme($("#theme_list").val()));
		}
	});
	
	// change active_tab_font_bold
	$(document).on("click", "#active_tab_font_bold", function(event){
		ColorsSet.active_font_weight = $(this)[0].checked ? "bold" : "normal";
		AppendCSSSheets(SaveTheme($("#theme_list").val()));
	});
	
	// show close button on hover
	$(document).on("mouseenter", ".close", function(event){
		$(this).addClass("close_hover");
	});
	$(document).on("mouseleave", ".close", function(event){
		$(".close_hover").removeClass("close_hover");
	});
	
	// tabs on hover
	$(document).on("mouseover", ".tab_header", function(event){
		$(this).addClass("tab_header_hover").addClass("close_show");
	});

	$(document).on("mouseleave", ".tab_header", function(event){
		$(this).removeClass("tab_header_hover").removeClass("close_show");
	});

	$(document).on("click", "#button_tools, #button_search", function(event){
		if (event.button != 0){
			return;
		}
		if ($(this).is(".on")){
			$("#button_tools, #button_search").removeClass("on");
			$("#toolbar_tools, #toolbar_search").addClass("hidden");
		} else {
			$(this).addClass("on");
			if ($(this).is("#button_tools")){
				$("#button_search").removeClass("on");
				$("#toolbar_search").addClass("hidden");
				$("#toolbar_tools").removeClass("hidden");
			} else {
				$("#button_tools").removeClass("on");
				$("#toolbar_tools").addClass("hidden");
				$("#toolbar_search").removeClass("hidden");
			}
		}
	});

}

// shrink or expand theme field
function RefreshFields(){
	if ($("#theme_list")[0].options.length == 0){
		$("#field_theme").css({"height": "45px"});
	} else {
		$("#field_theme").css({"height": ""});
	}
	if (navigator.userAgent.match("Firefox") !== null){
		$("#field_scrollbars").hide();
	} else {
		$("#faster_scroll_for_firefox").hide();
	}
	if (navigator.userAgent.match("Vivaldi") !== null){
		$("#url_for_web_panel").val(chrome.runtime.getURL("sidebar.html"));
		$("#url_for_web_panel").prop("readonly", true);
		$("#url_for_web_panel").select();
	} else{
		$("#field_vivaldi").hide();
	}
}