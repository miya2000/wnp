// ==UserScript==
// @name       window nicovideo player
// @author     miya2000
// @namespace  http://d.hatena.ne.jp/miya2000/
// @version    1.0.0 RC2
// @include    http://www.nicovideo.jp/*
// @exclude    http://www.nicovideo.jp/watch/*
// @exclude    http://www.nicovideo.jp/swf/billboard_summer.swf
// @exclude    http://*http://*
// ==/UserScript==
/*
 * $Date:: 2008-09-21 20:28:20 +0900#$
 */
/*
 Open Niconico (http://www.nicovideo.jp/),
 and start with the right-bottom button on the page.

 @see http://d.hatena.ne.jp/kotas/20070925/playlist
      http://abc.s65.xrea.com/prox/wiki/%A5%D5%A5%A3%A5%EB%A5%BF%A1%A2%A5%EA%A5%B9%A5%C8%B8%F8%B3%AB/nicovideo/#iroiro
      http://blog.fulltext-search.biz/articles/2008/01/31/nico-nico-player-wrapper
*/
(function() {

var MAIN = function() {

    // == options == //
    var WNP_WIDTH  = 610;  // startup window size.
    var WNP_HEIGHT = 470;  //
    var WNP_LOOP_ON_STARTUP = false;                   // "loop" on startup.
    var WNP_COMMENT_OFF_ON_STARTUP = false;            // "comment-off" on startup.
    var WNP_ALWAYS_ON_TOP_ON_STARTUP = false;          // "always on top" on startup.
    var WNP_PLAYLIST_STYLE_SIMPLE_ON_STARTUP = false;  // "playlist style simple" on startup.
    var WNP_PLAYER_CONTROL_WITH_COMMENT_INPUT = false; // show comment input when the wnp shows nicovideo player controls.
    var WNP_SKIP_DELETED_MOVIE = false;                // skip deleted movie.
    var WNP_MENU_WIDTH_RATIO = 50;  // (%)   menu width ratio when showing menu.
    var WNP_OBSERVE_INTERVAL = 500; // (ms)  observe interval.
    var WNP_PAGE_TIMEOUT  = 30;     // (sec) page load timeout.
    var WNP_VIDEO_TIMEOUT = 60;     // (sec) video play timeout.
    var WNP_OFFTIMER      = 120;    // (min) off timer.
    var WNP_GLOBAL_NAME = 'WNP';    // global name of WNP entry object.

    // ==== const ==== //
    var WNP_IMAGE_SAVE = 'data:image/gif;base64,R0lGODlhEAAQAIAAAAAAAPD4%2FyH5BAEAAAAALAAAAAAQABAAAAIhhI%2Bpq%2BEPHYo0zAovlscy4BnhMo7N9IHoV6Ytq23pTAMFADs%3D';
    var ORG_PLAYER_WIDTH       = 952;
    var ORG_PLAYER_VIEW_WIDTH  = 544;
    var ORG_PLAYER_VIEW_HEIGHT = 384;
    var ORG_PLAYER_MARGIN_TOP  = 65;
    var ORG_PLAYER_MARGIN_LEFT = 6;
    var ORG_PLAYER_CONTROL_HEIGHT = (WNP_PLAYER_CONTROL_WITH_COMMENT_INPUT) ? 86 : 52;

    // ==== main ==== //
    var WNP_VERSION = '1.0.0';
    var WNP_TITLE = 'WNP';
    var MINITV_TITLE = 'miniTV';
    var moz = (navigator.userAgent.indexOf("Gecko/") >= 0);
    var opera9_5 = (navigator.appName.indexOf("Opera") >= 0 && /^9.5/.test(opera.version())); // I hope this bug will fix at Opera 10.
    
    var html = [
'<!DOCTYPE html PUBLIC "-\/\/W3C\/\/DTD HTML 4.01 Transitional\/\/EN" "http:\/\/www.w3.org/TR/html4/loose.dtd">',
'<html>',
'<head>',
'<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
'<title>' + WNP_TITLE + '</title>',
'<style type="text/css">',
'html, body, div, p, ul, dl, li, img { margin: 0; padding: 0; border: none; }',
'html, body {',
'    width: 100%; height: 100%; background-color: black;',
'}',
'div.wnp_player { ',
'    width: 100%; height: 100%;',
'    position: relative;',
'    overflow: hidden;',
'    background-color: black;',
'    line-height: 1.1em;',
'    font-size: 12px;',
'}',
'div.wnp_header, div.wnp_footer {',
'    box-sizing: border-box;', moz ? '-moz-box-sizing : border-box;' : '',
'    width: 100%;',
'    height: 20px;',
'    color: #F0F8FF;',
'    font-family:\'\u30D2\u30E9\u30AE\u30CE\u89D2\u30B4\u0020Pro\u0020W3\',\'\u30E1\u30A4\u30EA\u30AA\',Meiryo,Verdana,sans-serif;',
'    font-size: 14px;',
'    font-weight: bold;',
'    line-height: 20px;',
'    padding: 0 5px;',
'    position: relative;',
'    z-index: 1;',
'    overflow: hidden;',
'}',
'div.wnp_footer {',
'    padding-top: 2px;',
'}',
'div.wnp_header div.header_left {',
'    text-align: left;',
'    position: absolute;',
'}',
'div.wnp_header div.header_right {',
'    text-align: right;',
'}',
'div.wnp_header a, div.wnp_footer a {',
'    color: inherit;',
'    text-decoration: none;',
'    margin: 0 0.4em;',
'}',
'div.wnp_header a:visited, div.wnp_footer a:visited {',
'    color: inherit;',
'}',
'div.wnp_header button, div.wnp_footer button {',
'    color: inherit;',
'    font-family: inherit;',
'    cursor: pointer;',
'    background-color: transparent;',
'    border: none;',
'    margin: 0; padding: .25em 0 0;',
'}',
'div.wnp_header .control, div.wnp_footer .control {',
'    visibility: hidden;',
'}',
'div.wnp_header:hover .control, div.wnp_footer:hover .control {',
'    visibility: visible;',
'    cursor: pointer;',
'}',
'div.wnp_footer:hover .wnp_control_panel {',
'    visibility: visible;',
'}',
'div.wnp_view {',
'    box-sizing: border-box;', moz ? '-moz-box-sizing : border-box;' : '',
'    width: 100%; height: 100%;',
'    margin: -20px 0;',
'    border: #050608 solid;',
'    border-width: 20px 0;',
'    z-index: 0;',
'}',
'div.wnp_menu {',
'    box-sizing: border-box;', moz ? '-moz-box-sizing : border-box;' : '',
'    position: absolute;',
'    z-index: 0;',
'    top: 0px;',
'    right: 0;',
'    width: 0;',
'    height: 100%;',
'    padding: 20px 0;',
'    border-right: #050608 solid 0px;',
'}',
'ul.wnp_playlist_items {',
'    box-sizing: border-box;', moz ? '-moz-box-sizing : border-box;' : '',
'    background-color: #D0DAEF;',
'    list-style: none;',
'    height: 100%;',
'    position: relative;',
'    overflow: auto;',
'    border-style: solid;',
'    border-width: 0 0 20px;',
'    margin-bottom: -20px;',
'}',
'.wnp_playlist_footer {',
'    height: 19px;',
'    border-top: #CCC solid 1px;',
'    padding: 0 5px 0 0;',
'    position: relative;',
'    overflow: hidden;',
'    background-color: #E7E7EF;',
'    color: #000;',
'    line-height: 18px;',
'    font-size: 12px;',
'}',
'.wnp_playlist_footer input[type="checkbox"] {',
'    margin: 0 .2em 0 .5em;',
'}',
'ul.wnp_playlist_items li {',
'    height: 50px;',
'    line-height: 24px;',
'    border: transparent solid;',
'    border-width: 0 0 0 3px;',
'    border-bottom: white solid 1px;',
'    padding: 3px 0 2px;',
'    overflow: hidden;',
'}',
'ul.wnp_playlist_items li div.video_info {',
'    width: 80px;',
'    float: left;',
'}',
'ul.wnp_playlist_items li div.video_info .playmark {',
'    margin-left: -0.7em;',
'    margin-right: 3px;',
'    visibility: hidden;',
'    color: #3D7FEA;',
'    font-size: 16px;',
'}',
'ul.wnp_playlist_items li div.video_info img.thumbnail {',
'    width: 65px;',
'    height: 50px;',
'    vertical-align: middle;',
'}',
'ul.wnp_playlist_items li div.video_desc {',
'    white-space: nowrap;',
'    overflow: hidden;',
'    font-size: 12px;',
'}',
'ul.wnp_playlist_items li a {',
'    color: #000;',
'    text-decoration: none;',
'}',
'ul.wnp_playlist_items li a:visited {',
'    color: #595959;',
'}',
'ul.wnp_playlist_items li a:hover {',
'    background-color: #B0D0FF;',
'}',
'ul.wnp_playlist_items li:after { display: block; content: ""; height: 0; clear: both; }',
'input, button {',
'    font-size: 12px;',
'    line-height: 1.1em;',
'}',
'div.wnp_footer span.wnp_status_bar {',
'    color: white;',
'    font-weight: normal;',
'    white-space: nowrap;',
'}',
'div.wnp_player select.mylist {',
'    margin-left: 5px;',
'    width: 130px;',
'}',
'div.wnp_player button.default_button { }',
'div.wnp_player img.button { width: .8em; height: .8em; }',
'div.wnp_player.playing #WNP_C_PLAY, div.wnp_player.loading #WNP_C_PLAY {',
'    text-decoration: line-through;',
'}',
'div.wnp_player .loop {',
'    color: yellow !important;',
'}',
'div.wnp_player .comment_off, .mute {',
'    text-decoration: line-through; ',
'    color: yellow !important;',
'}',
'div.wnp_player .always_on_top {',
'    color: yellow !important;',
'}',
'div.wnp_player .error {',
'    font-weight: bold; color: red !important;',
'}',
'div.wnp_player ul.wnp_playlist_items li.playing .video_desc {',
'    font-weight: bold;',
'}',
'div.wnp_player ul.wnp_playlist_items li.playing .playmark {',
'    visibility: visible;',
'}',
'ul.wnp_playlist_items li.hover {',
'   background-color: #D7EBFF;',
'}',
'div.wnp_player ul.wnp_playlist_items li.selected {',
'    background-color: #B4DAFF;',
'}',
'div.wnp_player ul.wnp_playlist_items li.dragging {',
'    background-color: #FFCCCC;',
'}',
'ul.dragging a:hover {',
'    background-color: transparent !important;',
'}',
'div.wnp_control_panel {',
'    box-sizing: border-box;', moz ? '-moz-box-sizing : border-box;' : '',
'    padding-left: 20px;',
'    visibility: hidden;',
'    position: absolute;',
'    top: 0; left: 0;',
'    width: 100%;',
'    height: 18px;',
'}',
'div.wnp_seekbar {',
'    float: left;',
'    width: 45%;',
'    height: 100%;',
'    cursor: pointer;',
'    margin: 0 10px 0 5px;',
'}',
'div.wnp_seekbar > div {',
'    width: 100%;',
'    height: 5px;',
'    margin-top: 8px;',
'    background-color: #84AFCF;',
'}',
'div.wnp_seekbar > div > div {',
'    height: 100%;',
'    width: 0;',
'    background-color: #548FCF;',
'}',
'div.wnp_volumebar {',
'    float: left;',
'    width: 55px;',
'    height: 100%;',
'    cursor: pointer;',
'    margin: 0 10px 0 5px;',
'}',
'div.wnp_volumebar > div {',
'    width: 100%;',
'    height: 5px;',
'    margin-top: 8px;',
'    background-color: #FFE4E1;',
'}',
'div.wnp_volumebar > div > div {',
'    height: 100%;',
'    width: 0%;',
'    background-color: #F08080;',
'}',
'div.wnp_footer div.wnp_control_panel .control {',
'    font-size: 14px;', 
'    margin: 2px 0.2em 0;', moz ? 'font-size: 12px; margin: 0 0.2em; ' : '',
'    padding: 0;',
'    visibility: inherit;',
'}',
'div.wnp_etcbar {',
'    float: left;',
'    width: 40%;',
'    overflow: visible;',
'    height: 100%;',
'}',
'span.wnp_button_container {',
'    float: left;',
'    width: 20px;', 
'    text-align: right;',
'}',
'div.wnp_footer div.wnp_control_panel button.wnp_pause {',
'    font-size: 12px;', 
'    margin-top: 3px;', 
'}',
//'* { border-color: transparent !important; background-color: transparent !important }',
'</style>',
'</head>',
'<body>',
'<div class="wnp_player" id="WNP_PLAYER">',
'    <div class="wnp_header" id="WNP_HEADER">',
'        <div class="header_left">',
'            <button class="control" id="WNP_C_SCREEN" title="Full or Restore or Alternative View(V)">\u25A0</button>',
'            <button class="control" id="WNP_C_ALWAYS_ON_TOP" title="Always On Top">\u22BF</button>',
'        </div>',
'        <div class="header_right">',
'            <a class="control" id="WNP_C_PREV" title="Prev(PageUp)" href="about:blank">&lt;</a>',
'            <button class="control" id="WNP_C_PLAY" title="Play or Stop">\u266A</button>',
'            <a class="control" id="WNP_C_NEXT" title="Next(PageDown)" href="about:blank">&gt;</a>',
'            <a class="control" id="WNP_C_PLAYLIST_URI" title="Save" href="about:blank"><img class="button" src="' + WNP_IMAGE_SAVE + '" alt=""></a>',
'            <button class="control default_button" id="WNP_C_MENU" title="Show or Hide Playlist(M)">\u25BD</button>',
'        </div>',
'    </div>',
'    <div class="wnp_view" id="WNP_VIEW"></div>',
'    <div class="wnp_footer" id="WNP_FOOTER">',
'        <button class="control default_button" title="Show Nicovideo Player Controls" id="WNP_C_NICO_MENU">\u25B3</button>',
'        <span class="wnp_status_bar" id="WNP_STATUS_BAR"></span>',
'        <div class="wnp_control_panel" id="WNP_CONTROL_PANEL">',
'            <span class="wnp_button_container"><button class="control wnp_pause" title="Pause or Resume(Space)" id="WNP_C_NICO_PAUSE">||</button></span>',
'            <div class="wnp_seekbar" id="WNP_C_NICO_SEEKBAR" title="Seek(Left/Right)"><div><div></div></div></div>',
'            <div class="wnp_etcbar">',
'                <span class="wnp_button_container"><button class="control" id="WNP_C_NICO_MUTE" title="Mute(S)">\u03BC</button></span>',
'                <div class="wnp_volumebar" id="WNP_C_NICO_VOLUMEBAR" title="Volume(Up/Down)"><div><div></div></div></div>',
'                <button class="control" id="WNP_C_NICO_COMM" title="Comment on/off(C)">\u24D2</button>',
'                <button class="control" id="WNP_C_NICO_LOOP" title="Loop on/off(L)">\u221E</button>',
'            </div>',
'        </div>',
'    </div>',
'    <div class="wnp_menu" id="WNP_MENU">',
'        <ul class="wnp_playlist_items" id="WNP_PLAYLIST_ITEMS">',
'        </ul>',
'        <p class="wnp_playlist_footer"><input id="WNP_C_PLAYLIST_STYLE" type="checkbox"><label for="WNP_C_PLAYLIST_STYLE">simple</label></p>',
'    </div>',
'</div>',
'</body>',
'</html>'
    ].join('\n');

    var minitv_html = [
'<!DOCTYPE html PUBLIC "-\/\/W3C\/\/DTD HTML 4.01 Transitional\/\/EN" "http:\/\/www.w3.org/TR/html4/loose.dtd">',
'<html>',
'<head>',
'<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
'<title>' + MINITV_TITLE + '</title>',
'<script type="text/javascript">var miniTV = {isShowing : true};</script>',
'<style type="text/css">',
'html, body, div, p, ul, dl, li, img { margin: 0; padding: 0; border: none; }',
'html, body {',
'    width: 100%; height: 100%; background-color: white;',
'}',
'div.main_container {',
'    box-sizing: border-box;', moz ? '-moz-box-sizing : border-box;' : '',
'    width: 100%; height: 100%;',
'    border: transparent solid;',
'    border-width: 0 0 30px;',
'    z-index: 0;',
'}',
'iframe.main_frame {',
'    width: 100%; height: 100%;',
'    margin: 0; padding: 0;',
'    border: none;',
'}',
'div.minitv_controls {',
'    position: relative;',
'    z-index: 10;',
'    width: 100%; height: 28px;',
'    margin-top: -30px;',
'    color: white;',
'    background-color: #9999AA;',
'    border-top: #DCDCDC ridge 2px;',
'}',
'div.control_group_1 {',
'    text-align: right;',
'    padding: 4px 20px 0;',
'    white-space: nowrap;',
'    overflow: hidden;',
'}',
'div.minitv_controls button {',
'    color: black;',
'    font-size: 12px;',
'    line-height: 1.2;',
'    font-family: monospace;',
'}',
'div.minitv_container {',
'    position: fixed;',
'    top: 25px; right: 25px;',
'    box-sizing: border-box;', moz ? '-moz-box-sizing : border-box;' : '',
'    width: 300px; height: 230px;',
'    background-color: #EEE;',
'    border: none;',
'    z-index: 0;',
'}',
'div.wnp_footer {',
'    display : none; ',
'}',
'@media projection {',
'    body > * {',
'        display: none;',
'    }',
'    div.minitv_container {',
'        display: block;',
'        position: static;',
'        border: #050608 solid;',
'        border-width: 20px 0;',
'        width: 100%; height: 100%;',
'        page-break-after: avoid;',
'    }',
'    div.wnp_footer {',
'        display : block; ',
'        height : 20px; ',
'        margin-top : -20px; ',
'        font-size: 14px;',
'        line-height: 20px;',
'        overflow: hidden;',
'    }',
'    div.wnp_footer .control {',
'        color: red;',
'        background-color: transparent;',
'        border: none;',
'        visibility: hidden;',
'    }',
'    div.wnp_footer:hover .control {',
'        visibility: visible;',
'    }',
'}',
'</style>',
'</head>',
'<body>',
'<div class="main_container">',
'<iframe class="main_frame" id="MAIN_FRAME" frameborder="0" width="970" height="540" src="' + location.href + '"></iframe>',
'</div>',
'<div class="minitv_container" id="MINITV_CONTAINER"></div>',
'<div class="wnp_footer" id="WNP_FOOTER">',
'    <button class="control default_button" title="Show Nicovideo Player Controls" id="WNP_C_NICO_MENU">\u25B3</button>',
'</div>',
'<div class="minitv_controls">',
'    <div class="control_group_1">',
'        nicovideo player:',
'        <button class="control" id="MINITV_C_OPEN" title="Open">open</button>',
'        <button class="control" id="MINITV_C_PLAY" title="Play">play</button>',
'        <button class="control" id="MINITV_C_ADD" title="Add">add</button>',
'        miniTV:',
'        <button class="control" id="MINITV_C_SHOW" title="Show or Hide miniTV">hide</button>',
'        <button class="control" id="MINITV_C_STOP" title="Stop miniTV play">stop</button>',
'        <button class="control" id="MINITV_C_CONT" title="Show or Hide miniTV Controlls ">control</button>',
'        <button class="control" id="MINITV_C_SCRE" title="Full or Restore Frame">view</button>',
'        size <select id="MINITV_C_SIZE"><option selected="selected">1</option><option>2</option><option>full</option></select>',
'    </div>',
'</div>',
'</body>',
'</html>'
    ].join('\n');

    var page_style = [
'.wnp_tooltip {',
'    width: 100px;',
'    border: #BCD solid;',
'    border-width: 1px 3px 1px 1px;',
'    color: #335577;',
'}',
'.wnp_tooltip a, .wnp_tooltip span {',
'    cursor: pointer;',
'    display: block;',
'    width: 30px;',
'    height: 15px;',
'    line-height: 15px;',
'    font-family: cursive;',
'    font-size: 14px;',
'    text-align: center;',
'    text-decoration: none;',
'    color: inherit;',
'    font-weight: bold;',
'    border: double 6px #FFF;',
'    background-color: #CDE;',
'    padding: 3px 5px;',
'    float: left;',
'    margin-right: -2px;',
'}',
'.wnp_tooltip a:hover, .wnp_tooltip span:hover {',
'    background-color: #DEF;',
'}',
'.wnp_tooltip a:active, .wnp_tooltip span:active { padding: 4px 4px 2px 6px; }',
'.wnp_tooltip a:visited { color: #595959; }',
    ].join('\n');


var svg_xml_base = [
'<?xml version="1.0" encoding="utf-8" ?>',
'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 380 230">',
'<defs>',
'    <linearGradient id="liGrad" x1="0" y1="0" x2="0" y2="1">',
'        <stop offset="0" stop-color="white" stop-opacity="0.2" />',
'        <stop offset="0.3" stop-color="white" stop-opacity="1" />',
'    </linearGradient>',
'    <clipPath id="clip_txt">',
'        <path d="m 0 0 h 220 v 150 h -220 v -150 z" />',
'    </clipPath>',
'</defs>',
'<rect width="380" height="250" fill="white" />',
'<g transform="translate(0,50)">',
'    <image x="10" width="130" height="100" xlink:href="%u" />',
'    <image id="mirror" x="10" width="130" height="100" xlink:href="%u" transform="matrix(1,0,0,-1,0,200)" />',
'    <rect id="grad" y="100" width="150" height="100" fill="url(#liGrad)" />',
'</g>',
'<g clip-path="url(#clip_txt)" transform="translate(150,50)" font-family="Verdana,sans-serif" font-weight="bold">',
'    <text y="30" style="font-size: 15px;">%t',
'        <animate attributeName="x" values="0;0;-300" keyTimes="0;0.25;1" dur="10s" repeatDur="indefinite" /> ',
'    </text>',
'    <text x="5" y="80" style="font-size: 12px;">%c</text>',
'</g>',
'<script type="text/javascript">',
'<![CDATA[',
'    if (navigator.userAgent.indexOf("Gecko/") != -1) {',
'        document.getElementById("mirror").style.display = "none";',
'        document.getElementById("grad").style.display = "none";',
'    }',
'    if (navigator.userAgent.indexOf("Safari") != -1) {',
'        document.getElementById("mirror").setAttribute("transform", "matrix(1,0,0,-1,0,199)");',
'    }',
']]>',
'</script>',
'</svg>'
].join('\n');
var svg_mime_type = 'image/svg+xml';

    // -- utils --
    // event.
    var $e = (function() {
        if (window.addEventListener) {
            return function(el) { return el };
        }
        function _preventDefault()  { this.returnValue  = false; }
        function _stopPropagation() { this.cancelBubble = true;  }
        function compat(e, el) {
            if ( ! ('preventDefault'  in e)) e.preventDefault = _preventDefault;
            if ( ! ('stopPropagation' in e)) e.stopPropagation = _stopPropagation;
            if ( ! ('target'          in e)) e.target = e.srcElement;
            if ( ! ('relatedTarget'   in e)) e.relatedTarget = (e.srcElement == e.toElement) ? e.fromElement : e.toElement;
            if ( ! ('currentTarget'   in e)) e.currentTarget = el;
            var d = el.ownerDocument || el.document || el;
            if ( ! ('pageX'           in e)) e.pageX = (d.body.scrollLeft||d.documentElement.scrollLeft) + e.clientX;
            if ( ! ('pageY'           in e)) e.pageY = (d.body.scrollTop ||d.documentElement.scrollTop ) + e.clientY;
        }
        if (window.attachEvent) {
            var listeners = [];
            return function(el) {
                if (el.addEventListener) return el;
                el.addEventListener = function(a, b, c) {
                    var f = function(e) { compat(e, el); b(e); };
                    el.attachEvent('on' + a, f);
                    listeners.push({ a: a, b: b, c: c, f: f});
                };
                el.removeEventListener = function(a, b, c) {
                    for (var i = 0; i < listeners.length; i++) {
                        var l = listeners[i];
                        if (l.a == a && l.b == b && l.c == c) {
                            el.detachEvent('on' + a, l.f);
                            listeners.splice(i, 1);
                            break;
                        }
                    }
                };
                return el;
            }
        }
        else {
            return function(el) {
                if (el.addEventListener) return el;
                el.addEventListener = function() {};
                el.removeEventListener = function() {};
                throw 'Neither "addEventListener" nor "attachEvent" is supported on this browser.';
            }
        }
    })();

    function toJSON(o) {
        if (o == null) {
            return 'null';
        }
        var c = o.constructor;
        if (c == Boolean) {
            return o.toString();
        }
        if (c == Number) {
            return isNaN(o) ? '"NaN"' : !isFinite(o) ? '"Infinity"' : o.toString(10);
        }
        if (c == String) {
            return '"' + uescape(o) + '"';
        }
        if (c == Array) {
            var tmp = [];
            for (var i = 0; i < o.length; i++) {
                tmp[i] = toJSON(o[i]);
            }
            return '[' + tmp.join(',') + ']';
        }
        if (o.toString() == '[object Object]') {
            var tmp = [];
            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    tmp.push('"' + uescape(i) + '":' + toJSON(o[i]));
                }
            }
            return '{' + tmp.join(',') + '}';
        }
        return '\"' + uescape(o.toString()) + '\"';
    }
    function uescape(s) {
        return escape(s).replace(/%([0-9A-F]{2})/g, '\\u00$1').replace(/%u/g, '\\u');
    }

    var escapeHTML = (function() {
        var dv = document.createElement('div');
        return function(str) {
            dv.textContent = str;
            return dv.innerHTML;
        };
    })()

    function getAbsolutePosition(el) {
        var p = el, x = 0, y = 0;
        while (p.offsetParent) {
            x += p.offsetLeft, y += p.offsetTop, p = p.offsetParent;
        }
        return { x : x, y : y }
    }

    function hasClass(el, className) {
        return new RegExp('\\b' + className + '\\b').test(el.className);
    }
    function appendClass(el, className) {
        if (!el) return;
        if (new RegExp('\\b' + className + '$').test(el.className)) return;
        removeClass(el, className);
        el.className += ' ' + className;
    }
    function removeClass(el, className) {
        if (!el) return;
        var orgClassName = el.className;
        var newClassName = orgClassName.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
        if (orgClassName != newClassName) {
            el.className = newClassName;
        }
    }
    function addStyle(styleStr, doc) {
        var document = doc || window.document;
        var style = document.createElement('style');
        style.type = 'text/css';
        style.style.display = 'none';
        style.innerHTML = styleStr;
        style.ownerDocument.body.appendChild(style);
        return style;
    }

    function getStyle(element, property, pseudo) {
        return (
            element.currentStyle
            ||
            element.ownerDocument.defaultView.getComputedStyle(element, pseudo || '')
        )[property];
    }

    function $XS(xpath, context) {
        return document.evaluate(xpath,context||document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
    }

    function guessTitle(a) {
        var title = a.textContent.replace(/^\s+|\s+$/g, '');
        if (!title) {
            var img = a.getElementsByTagName('img')[0];
            if (img) title = (img.alt || '').replace(/^\s+|\s+$/g, '');
        }
        return title;
    }

    function createPlayInfo(el) {
        var an = el.getElementsByTagName('a');
        if (an.length == 0 && /a/i.test(el.nodeName)) {
            an = [el];
        }
        var items = [],
            video = {},
            title = {},
            image = {};
        for (var i = 0; i < an.length; i++) {
            var a = an[i];
            if (/\bnofollow\b/.test(a.getAttribute('rel'))) continue;
            if (/http:\/\/www\.nicovideo\.jp\/watch\/(\w*)$/.test(a.href)) {
                var videoid = RegExp.$1;
                if (!video[videoid]) {
                    items.push(videoid);
                    video[videoid] = a.href;
                }
                var img = a.getElementsByTagName('img')[0];
                if (img) {
                    title[videoid] = title[videoid] || img.alt;
                    image[videoid] = image[videoid] || img.src;
                }
                if (!title[videoid]) {
                    title[videoid] = a.textContent || a.innerText;
                }
            }
        }
        return { items: items, video: video, title: title, image: image }
    }

    var makeNicoReg = /(https?:\/\/[-_.!~*()a-zA-Z0-9;\/?:@&=+$,%#]+)|([a-z]{2}\d+)|(mylist\/\d+)|(^|\D)(\d{10})(?!\d)/mg;
    function makeNicoLinks(str) {
        return str
            .replace(makeNicoReg, function(str, $1, $2, $3, $4, $5, $6){
                if ($1 != null) return ' <a href="' + $1 + '" target="_blank" rel="nofollow">' + $1 + '</a> ';
                if ($2 != null) return ($2 == 'mp3') ? $2 : ' <a href="http://www.nicovideo.jp/watch/' + $2 + '" target="_blank" rel="nofollow">'+ $2 + '</a> ';
                if ($3 != null) return ' <a href="http://www.nicovideo.jp/' + $3 + '" target="_blank" rel="nofollow">'+ $3 + '</a> ';
                if ($5 != null) return $4 + ' <a href="http://www.nicovideo.jp/watch/' + $5 + '" target="_blank" rel="nofollow">'+ $5 + '</a> ';
            });
    }

    /**
     * class ListElementIterator
     */
    function ListElementIterator(listElement) {
        this.listElement = listElement;
        this.item = null;
    }
    ListElementIterator.prototype = {
        count : function() {
            var n = 0, childs = this.listElement.childNodes;
            for (var i = 0, len = childs.length; i < len; i++) {
                if (childs[i].nodeType == 1) n++;
            }
            return n;
        },
        indexOf : function(item) {
            var n = 0, childs = this.listElement.childNodes;
            for (var i = 0, len = childs.length; i < len; i++) {
                if (childs[i].nodeType == 1) {
                    if (childs[i] === item) return n;
                    n++;
                }
            }
            return -1;
        },
        current : function(item) {
            if (item && item.parentNode != this.listElement) throw 'illegal argument.';
            if (arguments.length > 0) this.item = item;
            return this;
        },
        first : function() {
            var c = this.listElement.firstChild;
            while (c && c.nodeType != 1) { c = c.nextSibling };
            return this.current(c);
        },
        last : function() {
            var c = this.listElement.lastChild;
            while (c && c.nodeType != 1) { c = c.previousSibling };
            return this.current(c);
        },
        index : function(index) {
            var n = 0, c = this.listElement.firstChild;
            while (c) {
                if (c.nodeType == 1) {
                    if (n == index) break;
                    n++;
                }
                c = c.nextSibling;
            }
            return this.current(c);
        },
        next : function(item) {
            var c = item || this.item;
            if (c) do { c = c.nextSibling } while (c && c.nodeType != 1);
            return this.current(c);
        },
        previous : function(item) {
            var c = item || this.item;
            if (c) do { c = c.previousSibling } while (c && c.nodeType != 1);
            return this.current(c);
        },
        isNullThenFirst : function() {
            if (this.item == null) this.first();
            return this;
        },
        isNullThenLast : function() {
            if (this.item == null) this.last();
            return this;
        }
    };

    /**
     * class Soar
     *   increase(decrease) target's property value rapidly.
     * -- public fields -- *
     * [constructor]
     *   object           - target object.
     *   option           - (optional)
     *     dualation        soaring time.
     *     delay            soaring interval time.
     *     coe              soaring ratio (0-1).
     * [method]
     *   from(attr)       - initial property values.
     *   to(attr)         - last property values.
     *   go()             - begin soaring.
     *   cancel()         - cancel soaring.
     * [propety]
     * [event]
     *   onfinish         - fire event when finished soaring.
     * ------------------- *
     * -- examples ------- *
     * 1.
     *   var sor = new Soar(div);
     *   soar.to({scrollTop: 100});
     *   soar.go();
     * 2.
     *   new Soar(div.style).from({width:'100px'}).to({width:'200px'}).go();
     */
    var Soar = function(object, option) {
        this.object = object;
        var o = option || {};
        this.duration = o.duration || 500;
        this.delay = o.delay || 10;
        this.coe = (o.coe != null) ? o.coe : 0.15;
    }
    Soar.prototype.from = function(attr) {
        this._from = attr;
        return this;
    };
    Soar.prototype.to = function(attr) {
        this._to = attr;
        return this;
    }
    Soar.prototype.go = function (win) {
        this.cancel();
        var obj = this.object;
        this.window = win || window;
        for (var p in this._from) {
            obj[p] = this._from[p];
        }
        var target = [];
        for (var p in this._to) {
            var start = Number(obj[p].toString().replace(/([0-9]*).*/,'$1'));
            var dest  = Number(this._to[p].toString().replace(/([0-9]*)(.*)/,'$1'));
            var unit = RegExp.$2;
            target.push({ prop: p, cur: start, dest: dest, unit: unit });
        }
        var n = Math.ceil(this.duration / this.delay);
        var self = this;
        var start = new Date().getTime();
        self.tid = this.window.setTimeout( function() {
            var now = new Date().getTime();
            var nn = (self.duration - (now - start)) / self.delay;
            while (n > nn && n > 0) {
                for (var i = 0, len = target.length; i < len; i++) {
                    var t = target[i];
                    t.cur = t.cur + (t.dest - t.cur) * ( 1/n + (1-1/n) * self.coe);
                }
                n--;
            }
            var finishCount = 0;
            for (var i = 0, len  = target.length; i < len; i++) {
                var t = target[i];
                var next = Math.round(t.cur);
                obj[t.prop] = next + t.unit;
                if (next == t.dest) finishCount++;
            }
            if (finishCount != target.length && n > 0) {
                self.tid = self.window.setTimeout(arguments.callee, self.delay);
            }
            else {
                self.isActive = false;
                if (self.onFinish) self.onFinish(self);
            }
        }, 0);
        this.isActive = true;
    }
    Soar.prototype.cancel = function() {
        if (this.isActive) {
            this.window.clearTimeout(this.tid);
            this.isActive = false;
        }
    }

    /**
     * class ListUtil
     *   append useful feature(s) to list element.
     * -- public fields -- *
     * [constructor]
     *   listElement      - target element.
     * [method]
     *   select(item)     - select item.
     *   cancel()         - cancel drag.
     * [propety]
     *   hoverClass       - append this to hover item's className.
     *   draggingClass    - append this to dragging item's className.
     *   selectedClass    - append this to selected item's className.
     * [event]
     *   onselect         - fire event when selected item.
     *   onitemover       - fire event when mouseover item(except dragging).
     *   onitemout        - fire event when mouseout item(except dragging).
     *   ondragstart      - fire event when drag start.
     *   ondragging       - fire event when dragging.
     *   ondragover       - fire event when drag over other draggable element.
     *   ondragend        - fire event when drag end.
     *   ondragcancel     - fire event when drag cancel.
     * ------------------- *
     */
    function ListUtil(listElement) {
        this.listElement = listElement;
        this.selectedItems = [];
        this.initEvents();
    }
    ListUtil.prototype = {
        select : function(element) {
            var items = this.selectedItems;
            for (var i = 0; i < items.length; i++) {
                removeClass(items[i], this.selectedClass || 'selected');
            }
            if (!element) return;
            this.selectedItems = [element];
            appendClass(element, this.selectedClass || 'selected');
            if (this.onselect) this.onselect(this);
        },
        itemOver : function(element) {
            appendClass(element, this.hoverClass || 'hover');
            if (this.onitemover) this.onitemover(element);
        },
        itemOut : function(element) {
            removeClass(element, this.hoverClass || 'hover');
            if (this.onitemout) this.onitemout(element);
        },
        dragStart : function(element) {
            this.target = element;
            this.targetProxy = this.createProxy(this.target);
            appendClass(this.targetProxy, this.selectedClass || 'dragging');
            this.target.style.display = 'none';
            this.target.parentNode.insertBefore(this.targetProxy, this.target);
            this.listElement.style.cursor = 'move';
            if (this.ondragstart) this.ondragstart(this);
        },
        dragging : function() {
            if (this.ondragging) this.ondragging(this);
        },
        dragOver : function(element) {
            // insert after if the proxy's position is previous of next position.
            for (var p = element; p && p != this.targetProxy; p = p.previousSibling);
            element.parentNode.insertBefore(this.targetProxy, (p) ? element.nextSibling : element);
            if (this.ondragover) this.ondragover(this);
        },
        dragEnd : function() {
            this.target.style.display = '';
            this.targetProxy.parentNode.replaceChild(this.target, this.targetProxy);
            this.target = this.targetProxy = null;
            this.listElement.style.cursor = '';
            if (this.ondragend) this.ondragend(this);
        },
        dragCancel : function() {
            this.targetProxy.parentNode.removeChild(this.targetProxy);
            this.target.style.display = '';
            this.target = this.targetProxy = null;
            this.listElement.style.cursor = '';
            if (this.ondragcancel) this.ondragcancel(this);
        },
        createProxy : function(el) {
            var proxy = el.cloneNode(true);
            proxy.removeAttribute('id');
            return proxy;
        },
        cancel : function() {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.dragCancel();
        },
        initEvents : function() {
            var document = this.listElement.ownerDocument;
            var self = this;
            var scrollTid = null;
            var direction = null;
            var range = 60;
            $e(document).addEventListener('keydown', this.event_keydown = function(e) {
                if (e.keyCode == 27) {
                    self.cancel();
                }
            }, false);
            $e(document).addEventListener('mouseup', this.event_document_mouseup = function(e) {
                if (self.isDragging) {
                    self.isDragging = false;
                    self.dragEnd();
                }
                if (scrollTid) {
                    document.defaultView.clearInterval(scrollTid);
                    scrollTid = direction = null;
                }
            }, false);
            $e(document).addEventListener('mousemove', this.event_document_mousemove = function(e) {
                if (self.isDragging) {
                    if (e.clientY < (self.listElement.offsetTop + 25)) {
                        // scroll up
                        var sub = (self.listElement.offsetTop + 25) - e.clientY;
                        range = 50 * (Math.ceil(sub/20));
                        if (scrollTid && direction != 1) {
                            document.defaultView.clearInterval(scrollTid);
                        }
                        if (direction != 1) {
                            direction = 1;
                            scrollTid = document.defaultView.setInterval(function() {
                                self.listElement.scrollTop -= range;
                            }, 100);
                        }
                    }
                    else if (e.clientY > (self.listElement.offsetTop + self.listElement.offsetHeight - 25)) {
                        // scroll down
                        var sub = e.clientY - (self.listElement.offsetTop + self.listElement.offsetHeight - 25);
                        range = 50 * (Math.ceil(sub/20));
                        if (scrollTid && direction != 2) {
                            document.defaultView.clearInterval(scrollTid);
                        }
                        if (direction != 2) {
                            direction = 2;
                            scrollTid = document.defaultView.setInterval(function() {
                                self.listElement.scrollTop += range;
                            }, 100);
                        }
                    }
                    else {
                        // stop scroll
                        if (scrollTid) {
                            document.defaultView.clearInterval(scrollTid);
                            scrollTid = direction = null;
                        }
                    }
                    self.dragging();
                }
            }, false);
            $e(this.listElement).addEventListener('mousedown', this.event_element_mousedown = function(e) {
                self.isDragging = true;
                e.preventDefault();
                var item = e.target;
                while (item.parentNode != e.currentTarget) item = item.parentNode;
                self.select(item);
                self.dragStart(item);
            }, false);
            $e(this.listElement).addEventListener('mouseover', this.event_element_mouseover = function(e) {
                if (!self.isDragging) {
                    // disable mousedown event on an inline element.
                    if (e.target == e.currentTarget || /inline/.test(getStyle(e.target, 'display'))) {
                        self.listElement.removeEventListener('mousedown', self.event_element_mousedown, false);
                    }
                    else {
                        self.listElement.addEventListener('mousedown', self.event_element_mousedown, false);
                    }
                }
                if (e.target != e.currentTarget) {
                    var item = e.target;
                    while (item.parentNode != e.currentTarget) item = item.parentNode;
                    if (item == self._hoverItem) return;
                    self._hoverItem = item;
                    if (self.isDragging) {
                        self.dragOver(item);
                    }
                    else {
                        self.itemOver(item);
                    }
                }
            }, false);
            $e(this.listElement).addEventListener('mouseout', this.event_element_mouseout = function(e) {
                if (self._hoverItem) {
                    var currentItem = self._hoverItem;
                    var item = e.relatedTarget;
                    while (item && item != self._hoverItem) item = item.parentNode;
                    if (item == self._hoverItem) return;
                    self._hoverItem = null;
                    if (!self.isDragging) {
                        self.itemOut(currentItem);
                    }
                }
            }, false);
        }
    };

    /**
     * class WNPCore
     *   nicovideo viewer.
     * -- public fields -- *
     * [method]
     *   play(videoid)    - play the video of videoid(or url).
     *   stop()           - stop playing video.
     *   fillView()       - resize player to container size.
     *   restoreView()    - cancel fill.
     *   alternativeView()- show alternative still image.
     *   setControlShowing(boolean) - show or hide control of flv player.
     * [propety]
     *   element          - player element.
     *   videoinfo        - set when video loaded. (has [videoid, url, thumb, title, desc] property.)
     *   style            - current style.
     *                      fill      : fill view.
     *                      restore   : original page view.
     *                      alternate : alternative still image.
     *   isPlaying        - if playing video then true, else false.
     *   isControlShowing - if control showing then true else false.
     *   errorWhenDeleted - raise error when the movie has been deleted.
     * [event]
     *   onload           - fire event when the video page loaded.
     *   onstart          - fire event when the video started.
     *   onerror          - fire event when could't load video. (deleted or other)
     *   onfinish         - fire event when finished playing video.
     * ------------------- *
     */
    var WNPCore = function(document, name) {
        this.element = this.build(document || window.document, name);
        this.videoinfo = null;
        this.isPlaying = false;
        this.style = WNPCore.STYLE_FILL;
        this.isControlShowing = false;
        this.onload = null;
        this.onstart = null;
        this.onerror = null;
        this.onfinish = null;
        this.observeInterval = WNP_OBSERVE_INTERVAL || 500;
    };
    WNPCore.STYLE_FILL      = 'fill';
    WNPCore.STYLE_RESTORE   = 'restore';
    WNPCore.STYLE_ALTERNATE = 'alternate';
    WNPCore.prototype = {
        build : function(document, name) {
            var dv = document.createElement('div');
            dv.style.cssText = [
                'box-sizing: border-box;', moz ? '-moz-box-sizing : border-box;' : '',
                'width: 100%; height: 100%;',
                'color: white;',
                'background-color: #4F586D;',
                'margin: 0; padding: 0;',
                'border-style: solid;',
                'border-color: #050608 black;',
                'border-width: 0;',
                'overflow: hidden;',
                'position: relative;',
            ].join('');
            dv.innerHTML = [
                '<div style="position: absolute; margin: 0; padding: 0; border: none; width: 100%; height: 100%; display: none; border-style: solid; box-sizing: border-box; ', moz ? '-moz-box-sizing : border-box; ' : '', 'border-color: #050608 black;">',
                '  <img style="display: none">',
                '  <p style="position:absolute; right: 5px; bottom: 15px; font-size: 30px; font-weight: bold; color: #AAA;"></p>',
                '</div>',
                '<iframe name="' + (name || '') + '" style="margin: 0; padding: 0; border: none; " frameborder="0" scrolling="no" width="970" height="540" src="about:blank"></iframe>',
            ].join('');
            this._container = dv;
            this._loadingbx = dv.childNodes[0];
            this._loadimage = dv.childNodes[0].getElementsByTagName('img')[0];
            this._caption = dv.childNodes[0].getElementsByTagName('p')[0];
            this._nicoframe = dv.childNodes[1];
            return dv;
        },
        loadingStart : function() {
            this.isLoading = true;
            this._caption.textContent = 'now loading.';
            this._caption.style.display = '';
        },
        loadingEnd : function() {
            this.isLoading = false;
            this._caption.style.display = 'none';
        },
        setAlternativeView : function(element, width, height) {
            if (element == null) {
                this.alternativeElement = null;
                this.alternativeElementSize = null;
                return;
            }
            this.alternativeElement = element;
            this.alternativeElementSize = { width: width, height: height };
        },
        play : function(videoinfo) {
            // resume when 0 arguments.
            if (!videoinfo && this.isPlaying) {
                this.resume();
                return;
            }
            this.videoinfo = videoinfo;
            var video_url = videoinfo.url || videoinfo.id || videoinfo;
            if (!/^http:/.test(video_url)) video_url = 'http://www.nicovideo.jp/watch/' + video_url;
            if (this._nicoframe.parentNode === this._container) {
                this._container.removeChild(this._nicoframe);
            }
            this._nicoframe.src = video_url;
            this.isPlaying = true;
            this.isPausing = false;
            this.loadingStart();
            this.layout();
            this._container.appendChild(this._nicoframe);
            this.currentLocation = this._nicoframe.src;
            this.observeLoad();
        },
        stop : function() {
            this.isPlaying = false;
            this.isPausing = false;
            this.observeTimerStop();
            this._container.style.borderWidth = '0';
            this._loadingbx.style.display = 'none';
            if (this._nicoframe.parentNode == this._container) {
                this._container.removeChild(this._nicoframe);
            }
            this.videoinfo = null;
            this.currentLocation = null;
            this.alternativeElement = null;
        },
        resume : function() {
            this.isPausing = false;
            var flvplayer = this._nicoframe.contentWindow.document.getElementById('flvplayer');
            if (!flvplayer) return;
            if (flvplayer.ext_getStatus() == 'paused') {
                flvplayer.ext_play(1);
            }
        },
        pause : function() {
            this.isPausing = true;
            var flvplayer = this._nicoframe.contentWindow.document.getElementById('flvplayer');
            if (!flvplayer) return;
            if (flvplayer.ext_getStatus() == 'playing') {
                flvplayer.ext_play(0);
            }
        },
        layout : function() {
            if (this.isLoading && this.style === WNPCore.STYLE_FILL) {
                this.alternativeView();
                this.style = WNPCore.STYLE_FILL;
                return;
            }
            switch (this.style) {
            case WNPCore.STYLE_RESTORE:   this.restoreView();     break;
            case WNPCore.STYLE_ALTERNATE: this.alternativeView(); break;
            default:                      this.fillView();        break;
            }
        },
        sight : function() {
            try {
                var nicoWindow = this._nicoframe.contentWindow;
                var nicoDocument = nicoWindow.document;
                var flvplayer = nicoDocument.getElementById('flvplayer');
                var p = getAbsolutePosition(flvplayer);
                nicoWindow.scrollTo(
                    p.x + Math.ceil(ORG_PLAYER_MARGIN_LEFT * this.zoom),
                    p.y + Math.ceil(ORG_PLAYER_MARGIN_TOP * this.zoom + 0.15) // fine adjustment.
                );
            }
            catch (e) {}
        },
        fillView : function() {
            this.style = WNPCore.STYLE_FILL;
            this.isControlShowing = false;
            if (!this.isPlaying) return;
            try {
                // calculate player width, height.
                var w = this._container.offsetWidth;
                var h = this._container.offsetHeight;
                this._nicoframe.style.display = 'none'; // for performance.
                this._nicoframe.style.visibility = 'hidden'; // for performance.
                this._nicoframe.style.width = '100%';
                this._nicoframe.style.height = '100%';
                this._loadingbx.style.display = 'none';
                var viewW = w - 20; // wmp frame
                var viewH = Math.floor(viewW * ORG_PLAYER_VIEW_HEIGHT / ORG_PLAYER_VIEW_WIDTH);
                if (viewH > h) {
                    viewH = h;
                    viewW = Math.floor(viewH * ORG_PLAYER_VIEW_WIDTH / ORG_PLAYER_VIEW_HEIGHT);
                }
                var playerW = Math.round(viewW * ORG_PLAYER_WIDTH / ORG_PLAYER_VIEW_WIDTH) + 2; // fine adjustment.
                var playerH = Math.round(viewH * ORG_PLAYER_WIDTH / ORG_PLAYER_VIEW_WIDTH);
                this.zoom = playerW / ORG_PLAYER_WIDTH;
                // set container's border.
                this._container.style.borderWidth = 
                    Math.ceil((h - viewH) / 2) + 'px ' + 
                    Math.floor((w - viewW) / 2) + 'px ' + 
                    Math.floor((h - viewH) / 2) + 'px ' + 
                    Math.ceil((w - viewW) / 2) + 'px';
                // player resize.
                if (!this._nicoframe.contentWindow || !this._nicoframe.contentWindow.document) return;
                var nicoWindow = this._nicoframe.contentWindow;
                var nicoDocument = nicoWindow.document;
                if (!moz) nicoDocument.documentElement.style.overflow = 'hidden';
                var flvplayer = nicoDocument.getElementById('flvplayer');
                if (!flvplayer) return;
                flvplayer.SetVariable('Stage.scaleMode', 'showAll');
                // set player width, height.
                flvplayer.style.width = flvplayer.parentNode.style.width = playerW + 'px';    // for scroll.
                flvplayer.style.height = flvplayer.parentNode.style.height = playerH + 'px';
                // scroll to player top-left.
                this._nicoframe.style.display = '';
                this.sight();
                this._nicoframe.style.visibility = 'visible';
                if (opera9_5) { // force relayout.
                    var self = this;
                    var nf = this._nicoframe;
                    nf.style.border = '0 dotted';
                    nf.ownerDocument.defaultView.setTimeout(function() {
                        nf.style.border = '0 solid';
                        //self.sight();
                    }, 400);
                }
            }
            catch (e) {
            }
            this._nicoframe.style.display = '';
            this._nicoframe.style.visibility = 'visible';
        },
        restoreView : function() {
            this.style = WNPCore.STYLE_RESTORE;
            this.isControlShowing = false;
            this._nicoframe.style.display = 'none'; // for performance.
            this._nicoframe.style.width = '100%';
            this._nicoframe.style.height = '100%';
            this._container.style.borderWidth = '0';
            this._loadingbx.style.display = 'none';
            try {
                var nicoWindow = this._nicoframe.contentWindow;
                var nicoDocument = nicoWindow.document;
                if (!moz) nicoDocument.documentElement.style.overflow = (this.isPlaying) ? 'scroll' : 'hidden';
                var flvplayer = nicoDocument.getElementById('flvplayer');
                flvplayer.style.width = flvplayer.parentNode.style.width = '';
                flvplayer.style.height = flvplayer.parentNode.style.height = '';
                flvplayer.SetVariable('Stage.scaleMode', 'noScale');
            }
            catch (e) {
            }
            this._nicoframe.style.display = '';
        },
        alternativeView : function() {
            this.style = WNPCore.STYLE_ALTERNATE;
            this._nicoframe.style.width = '1px';  // minimum viewing.
            this._nicoframe.style.height = '1px';
            this._container.style.borderWidth = '0';
            this._loadingbx.style.display = 'none';
            // set alternative element.
            var alterElement = this.alternativeElement;
            var alterSize = this.alternativeElementSize || {};
            if (!alterElement) {
                alterElement = new Image();
                if (this.videoinfo.thumbnail) {
                    alterElement.src = this.videoinfo.thumbnail;
                    alterSize = { width: 130, height: 100 };
                }
                else {
                    alterElement.src = 'http://ec1.images-amazon.com/images/G/09/nav2/dp/no-image-no-ciu.gif';
                    alterSize = { width: 192, height: 192 };
                }
            }
            alterElement.style.width = alterElement.style.height = '100%';
            alterElement.style.margin = alterElement.style.padding = '0';
            alterElement.style.border = 'none';
            alterElement.style.backgroundColor = 'black';
            this._loadingbx.replaceChild(alterElement, this._loadimage);
            this._loadimage = alterElement;
            // set loadingbx border.
            var imageW = alterSize.width || 130;
            var imageH = alterSize.height || 100;
            var w = this._container.offsetWidth, h = this._container.offsetHeight;
            var viewW = w - 30; // fine adjustment.
            var viewH = Math.floor(viewW * imageH / imageW);
            if (viewH > h) {
                viewH = h;
                viewW = Math.floor(viewH * imageW / imageH);
            }
            this._loadingbx.style.borderWidth = 
                Math.ceil((h - viewH) / 2) + 'px ' + 
                Math.floor((w - viewW) / 2) + 'px ' + 
                Math.floor((h - viewH) / 2) + 'px ' + 
                Math.ceil((w - viewW) / 2) + 'px';
            this._loadingbx.style.display = 'block';
        },
        setControlShowing : function(show) {
            if (!this.isPlaying || this.style != WNPCore.STYLE_FILL) return;
            if (this.isControlShowing === !!show) return;
            this.isControlShowing = !!show;
            var zoom = this.zoom;
            var controlHeight = Math.ceil(ORG_PLAYER_CONTROL_HEIGHT * zoom);
            var nicoDocument = this._nicoframe.contentWindow.document;
            nicoDocument.documentElement.scrollTop += (controlHeight * (show ? 1 : -1));
        },
        setCommentOff : function(off) {
            this.isCommentOff = !!off;
            if (!this.isPlaying) return;
            var flvplayer = this._nicoframe.contentWindow.document.getElementById('flvplayer');
            if (!flvplayer) return;
            // from iroiro.js
            flvplayer.ext_setCommentVisible(!this.isCommentOff);
        },
        setRepeat : function(repeat) {
            this.isRepeat = !!repeat;
            if (!this.isPlaying) return;
            var flvplayer = this._nicoframe.contentWindow.document.getElementById('flvplayer');
            if (!flvplayer) return;
            flvplayer.ext_setRepeat(this.isRepeat);
        },
        setMute : function(mute) {
            this.isMute = !!mute;
            if (!this.isPlaying) return;
            var flvplayer = this._nicoframe.contentWindow.document.getElementById('flvplayer');
            if (!flvplayer) return;
            flvplayer.ext_setMute(this.isMute);
        },
        seek : function(time) {
            if (!this.isPlaying) return;
            var flvplayer = this._nicoframe.contentWindow.document.getElementById('flvplayer');
            if (!flvplayer) return;
            var len = Number(flvplayer.ext_getTotalTime());
            var cur = Number(flvplayer.ext_getPlayheadTime());
            var to = cur + Number(time);
            if (isNaN(to)) return;
            if (to > len) to = len;
            if (to < 0  ) to = 0;
            flvplayer.ext_setPlayheadTime(to);
            // for shotage of backward seek.
            var cur = Number(flvplayer.ext_getPlayheadTime());
            if (time < 0 && cur - to > 5 && to > 10) {
                flvplayer.ext_setPlayheadTime(to - 10);
            }
            return to;
        },
        seekTo : function(sec) {
            if (!this.isPlaying) return;
            var flvplayer = this._nicoframe.contentWindow.document.getElementById('flvplayer');
            if (!flvplayer) return;
            var len = Number(flvplayer.ext_getTotalTime());
            var to = Number(sec);
            if (isNaN(to)) return;
            if (to > len) to = len;
            if (to <= 0) to = 0;
            flvplayer.ext_setPlayheadTime(to);
            return to;
        },
        current : function() {
            if (!this.isPlaying) return 0;
            var flvplayer = this._nicoframe.contentWindow.document.getElementById('flvplayer');
            if (!flvplayer) return 0;
            var cur = Number(flvplayer.ext_getPlayheadTime());
            return isNaN(cur) ? 0 : cur;
        },
        length : function() {
            if (!this.isPlaying) return -1;
            if (this.videoinfo.length != null) return this.videoinfo.length;
            var flvplayer = this._nicoframe.contentWindow.document.getElementById('flvplayer');
            var length = Number(flvplayer.ext_getTotalTime());
            if (isNaN(length)) return 0;
            this.videoinfo.length = length;
            return length;
        },
        volume : function(vol) {
            if (!this.isPlaying) return 0;
            var flvplayer = this._nicoframe.contentWindow.document.getElementById('flvplayer');
            if (!flvplayer) return 0;
            var cur = Number(flvplayer.ext_getVolume());
            if (vol == null) return cur;
            var to = cur + Number(vol);
            if (to > 100) to = 100;
            if (to < 0  ) to = 0;
            flvplayer.ext_setVolume(to);
            return to;
        },
        volumeTo : function(vol) {
            if (!this.isPlaying) return 0;
            var flvplayer = this._nicoframe.contentWindow.document.getElementById('flvplayer');
            if (!flvplayer) return 0;
            var to = Number(vol);
            if (to > 100) to = 100;
            if (to < 0  ) to = 0;
            flvplayer.ext_setVolume(to);
            return to;
        },
        observeLoad : function() {
            var self = this;
            var retry = 50; // retry for GreaseMonkey.
            this.observeTimerStart(function() {
                try {
                    var nicoWindow = self._nicoframe.contentWindow;
                    if (!nicoWindow)   return;
                    var nicoDocument = nicoWindow.document;
                    if (!nicoDocument) return;
                    if (nicoWindow.User && !nicoWindow.User.id) { // logout.
                        self.nicoFrameLoaded();
                        if (self.onload) try { self.onload(self) } catch (e) {}
                        if (self.onstart) try { self.onstart(self) } catch (e) {}
                        self.observeTimerStop();
                        return;
                    }
                    var flvplayer = nicoDocument.getElementById('flvplayer');
                    if (!flvplayer) return;
                    try {
                        if (flvplayer.ext_getStatus() != 'playing') return;
                    } catch(e) {
                        return;
                    }
                    // stop page observing and go to next state.
                    self.observeTimerStop();
                    if (this.errorWhenDeleted) {
                        // delete check.
                        if (/deleted/.test(flvplayer.GetVariable('o'))) {
                            if (self.onerror) self.onerror(self);
                            return;
                        }
                    }
                    self.nicoFrameLoaded();
                    if (self.onload) try { self.onload(self) } catch (e) {}
                    self.observePlay();
                }
                catch (e) {
                    // on error(perhaps security error), quit observing.
                    if (--retry == 0) {
                        self.observeTimerStop();
                        throw e;
                    }
                }
            }, 200);
        },
        observePlay : function() {
            var self = this;
            var videoStarted = false;
            var videoFinished = false;
            var currentW = this._container.offsetWidth;
            var currentH = this._container.offsetHeight;
            this.observeTimerStart(function() {
                try {
                    // reload if location changed.
                    var nicoWindow = self._nicoframe.contentWindow;
                    if (self.currentLocation != nicoWindow.location.href) {
                        self.currentLocation = nicoWindow.location.href;
                        self.observeLoad();
                        return;
                    }
                    // relayout if resized.
                    if (currentW != self._container.offsetWidth || currentH != self._container.offsetHeight) {
                        currentW = self._container.offsetWidth;
                        currentH = self._container.offsetHeight;
                        self.layout();
                    }
                    var flvplayer = nicoWindow.document.getElementById('flvplayer');
                    // start check.
                    if (!videoStarted) {
                        var move = Number(flvplayer.ext_getPlayheadTime());
                        if (isNaN(move)) return;
                        if (!self.isPausing && move < 2) return;
                        videoStarted = true;
                        if (self.onstart) try { self.onstart(self) } catch (e) {}
                    }
                    // finish check.
                    if (flvplayer.ext_getStatus() == 'end') {
                        if (flvplayer.ext_isRepeat()) return;
                        if (!videoFinished) {
                            videoFinished = true;
                            if (self.onfinish) try { self.onfinish(self) } catch (e) {}
                        }
                    }
                    else {
                        videoFinished = false;
                    }
                }
                catch (e) {
                    // on error(maybe security error), quit observing.
                    self.observeTimerStop();
                    throw e;
                }
            }, this.observeInterval);
        },
        observeTimerStart : function(func, interval) {
            var window = this.element.ownerDocument.defaultView;
            if (this.observeTid != null) window.clearInterval(this.observeTid);
            this.observeTid = window.setInterval(func, interval);
        },
        observeTimerStop : function() {
            var window = this.element.ownerDocument.defaultView;
            if (this.observeTid != null) window.clearInterval(this.observeTid);
            this.observeTid = null;
        },
        nicoFrameLoaded : function() {
            this.loadingEnd();
            this.layout();
            try {
                var nicoWindow = this._nicoframe.contentWindow;
                var nicoDocument = nicoWindow.document;
                this.videoinfo = nicoWindow.Video;
                var flvplayer = nicoDocument.getElementById('flvplayer');
                flvplayer.SetVariable('Overlay.onRelease', ''); // onPress 
                flvplayer.SetVariable('Overlay.hitArea', 0);
                this.setCommentOff(this.isCommentOff);
                this.setRepeat(this.isRepeat);
                this.setMute(this.isMute);
                if (this.isPausing) {
                    this.pause();
                }
            }
            catch (e) {
            }
        }
    };
    window.WNPCore = WNPCore;

    /**
     * WMP
     *   main object.
     */
    var WNP = function(targetWindow) {
        this.wnpWindow = targetWindow;
        this.build();
        this.wnpElement = this.wnpWindow.document.getElementById('WNP_PLAYER');
        var playlistElement = this.wnpWindow.document.getElementById('WNP_PLAYLIST_ITEMS');
        this.playlistIterator = new ListElementIterator(playlistElement);
        this.selectionIterator = new ListElementIterator(playlistElement);
        this.menuWidthRatio = WNP_MENU_WIDTH_RATIO;
        this.setLoop(WNP_LOOP_ON_STARTUP);
        this.setCommentOff(WNP_COMMENT_OFF_ON_STARTUP);
        this.setMute(false);
        this.setAlwaysOnTop(WNP_ALWAYS_ON_TOP_ON_STARTUP);
        this.setPlaylistStyleSimple(WNP_PLAYLIST_STYLE_SIMPLE_ON_STARTUP);
        this.wnpCore.errorWhenDeleted = !!WNP_SKIP_DELETED_MOVIE;
        this.playlist = { items: [], video: {}, title: {}, image: {} };
        this.isForceFilled = true; // fill on startup.
        this.lastOperationTime = new Date();
        this.lastUpdate = 0;
    };
    // WNP entry point.
    WNP.open = function(playlist, name) {
        this.add(playlist, name, true);
    };
    WNP.add = function(playlist, name, start) {
        var wnp = this.wnp(name);
        wnp.lastOperationTime = new Date();
        var ignoreStart = (new Date() - wnp.lastUpdate < 1000); // ignore start flag when last update within 1sec.
        var startPoint = wnp.playlist.items.length; // add point.
        if (!playlist || playlist == location.href) {
            wnp.add(createPlayInfo(document.getElementsByTagName('body')[0]));
        }
        else {
            if (/^((?:[a-z]{2})[0-9]+|[0-9]+)$/.test(playlist.toString())) {
                wnp.add({items: [playlist.toString()]});
            }
            else if (/^http:\/\/www\.nicovideo\.jp\/watch\/(\w+)/.test(playlist.toString())) {
                wnp.add({items: [RegExp.$1]});
            }
            else if (/^http:\/\/www\.nicovideo\.jp\/.*/.test(playlist.toString())) {
                wnp.addURL(playlist.toString(), start && !ignoreStart);
                return;
            }
            else {
                wnp.add(playlist);
            }
        }
        if (start && !ignoreStart) {
            if (wnp.playlist.items.length > 0) {
                wnp.wnpWindow.setTimeout(function() {
                    wnp.lastOperationTime = 0; // scroll to start point by force.
                    wnp.play(startPoint);
                    wnp.lastOperationTime = new Date();
                }, 0); // for firefox exception.
            }
        }
    };
    WNP.wnp = function(name) {
        var w = /*@cc_on window.open('','wnp'); // @*/ window.open('javascript:void(0)', name || 'wnp', 'top=0,left=' + (window.innerWidth - WNP_WIDTH) + ',width=' + WNP_WIDTH + ',height=' + WNP_HEIGHT + ',scrollbars=yes,resizable=yes');
        var wnp = w.wnp;
        if (!wnp) {
            wnp = new WNP(w);
            w.wnp = wnp;
            w.WNP = {
                open : WNP.open,
                add  : WNP.add,
                wnp  : function() { return wnp }
            }
        }
        w.focus();
        return wnp;
    };
    WNP.prototype.build = function() {
        var d = this.wnpWindow.document;
        d.open();
        d.write(html);
        if (!window.opera) d.close(); // error happens on Opera.
        this.wnpCore = new WNPCore(d);
        d.getElementById('WNP_VIEW').appendChild(this.wnpCore.element);
        var self = this;
        $e(d.getElementById('WNP_C_PREV')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.schedulePrev();
        }, false);
        $e(d.getElementById('WNP_C_PLAY')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.playToggle();
        }, false);
        $e(d.getElementById('WNP_C_NEXT')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.scheduleNext();
        }, false);
        $e(d.getElementById('WNP_C_NICO_LOOP')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.setLoop(!self.isLoop);
        }, false);
        $e(d.getElementById('WNP_C_NICO_COMM')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.setCommentOff(!self.isCommentOff);
        }, false);
        $e(d.getElementById('WNP_C_NICO_MUTE')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.setMute(!self.wnpCore.isMute);
        }, false);
        $e(d.getElementById('WNP_C_PLAYLIST_URI')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.wnpWindow.alert('\u3053\u306E\u30EA\u30F3\u30AF\u306F\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u30EC\u30C3\u30C8\u3067\u3059\u3002\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u306B\u767B\u9332\u3059\u308B\u3053\u3068\u3067\u3053\u306E\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u3092\u5FA9\u5143\u3067\u304D\u307E\u3059\u3002\n\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u30EC\u30C3\u30C8\u306F\u30CB\u30B3\u30CB\u30B3\u52D5\u753B(http://www.nicovideo.jp/)\u306E\u30C9\u30E1\u30A4\u30F3\u4E0A\u3067\u5B9F\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002');
        }, false);
        $e(d.getElementById('WNP_C_MENU')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.menuToggle();
        }, false);
        $e(d.getElementById('WNP_HEADER')).addEventListener('click', function(e) {
            self.menuToggle();
        }, false);
        $e(d.getElementById('WNP_C_SCREEN')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.layoutToggle();
        }, false);
        $e(d.getElementById('WNP_C_ALWAYS_ON_TOP')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.setAlwaysOnTop(!self.isAlwaysOnTop);
        }, false);
        $e(d.getElementById('WNP_C_PLAYLIST_STYLE')).addEventListener('click', function(e) {
            e.stopPropagation();
            self.setPlaylistStyleSimple(e.currentTarget.checked);
        }, false);
        $e(d.getElementById('WNP_FOOTER')).addEventListener('click', function(e) {
            self.wnpCore.setControlShowing(!self.wnpCore.isControlShowing);
        }, false);
        $e(d.getElementById('WNP_C_NICO_PAUSE')).addEventListener('click', function(e) {
            e.stopPropagation();
            self.pauseToggle();
        }, false);
        $e(d.getElementById('WNP_C_NICO_SEEKBAR')).addEventListener('click', function(e) {
            e.stopPropagation();
            if (!self.wnpCore.isPlaying) return;
            var seekbar = e.currentTarget;
            var width = seekbar.offsetWidth;
            var loc = (e.offsetX != null) ? e.offsetX : (e.layerX - seekbar.offsetLeft);
            var len = self.wnpCore.length();
            self.wnpCore.seekTo(len * (loc / width));
            self.updateControlPanelStatus();
        }, false);
        $e(d.getElementById('WNP_C_NICO_VOLUMEBAR')).addEventListener('click', function(e) {
            e.stopPropagation();
            if (!self.wnpCore.isPlaying) return;
            var volumebar = e.currentTarget;
            var width = volumebar.offsetWidth;
            var loc = (e.offsetX != null) ? e.offsetX : (e.layerX - volumebar.offsetLeft);
            var len = 100;
            self.wnpCore.volumeTo(len * (loc / width));
            self.updateControlPanelStatus();
        }, false);
        $e(d).addEventListener('keypress', function(e) {
            self.lastOperationTime = new Date();
            if (e.keyCode == 27) { // Esc
                self.restoreControlPanel();
                self.scheduleCancel();
                e.preventDefault();
            }
            if (e.keyCode == 33) { // Page Up
                self.schedulePrev();
                e.preventDefault();
            }
            if (e.keyCode == 34) { // Page Down
                self.scheduleNext();
                e.preventDefault();
            }
            if (e.keyCode == 38) { // up
                self.volume(5);
                e.preventDefault();
            }
            if (e.keyCode == 40) { // down
                self.volume(-5);
                e.preventDefault();
            }
            if (e.keyCode == 39) { // right
                self.seek(10);
                e.preventDefault();
            }
            if (e.keyCode == 37) { // left
                if (e.ctrlKey) self.seek(Number.NEGATIVE_INFINITY);
                else           self.seek(-10);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which) == 'j') {
                var list = d.getElementById('WNP_PLAYLIST_ITEMS');
                if (!self.selectionIterator.item) {
                    self.selectionIterator.current(self.playlistIterator.item);
                }
                self.selectionIterator.next().isNullThenFirst();
                if (self.selectionIterator.item == null) return;
                self.listUtil.select(self.selectionIterator.item);
                self.scrollPlaylistTo(self.selectionIterator.item);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which) == 'k') {
                var list = d.getElementById('WNP_PLAYLIST_ITEMS');
                if (!self.selectionIterator.item) {
                    self.selectionIterator.current(self.playlistIterator.item).isNullThenFirst();
                }
                else {
                    self.selectionIterator.previous().isNullThenLast();
                }
                if (self.selectionIterator.item == null) return;
                self.listUtil.select(self.selectionIterator.item);
                self.scrollPlaylistTo(self.selectionIterator.item);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which) == 'o') {
                var list = d.getElementById('WNP_PLAYLIST_ITEMS');
                if (self.selectionIterator && self.selectionIterator.item) {
                    self.playlistIterator.current(self.selectionIterator.item);
                    self.play();
                }
                e.preventDefault();
            }
            if (e.keyCode == 46) { // DEL
                var list = d.getElementById('WNP_PLAYLIST_ITEMS');
                if (self.selectionIterator && self.selectionIterator.item) {
                    var item = self.selectionIterator.item;
                    self.selectionIterator.next();
                    item.parentNode.removeChild(item);
                    self.selectionIterator.isNullThenLast();
                    appendClass(self.selectionIterator.item, 'selected');
                    self.scrollPlaylistTo(self.selectionIterator.item);
                }
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which) == 'm') {
                self.menuToggle();
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which) == 'c') {
                self.setCommentOff(!self.isCommentOff);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which) == 'l') {
                self.setLoop(!self.isLoop);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which) == 's') {
                self.setMute(!self.wnpCore.isMute);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which) == 'v') {
                self.layoutToggle();
                e.preventDefault();
            }
            if (e.keyCode == 32 || e.which == 32) { // SP
                self.pauseToggle();
                e.preventDefault();
            }
        }, false);
        $e(d).addEventListener('mousemove', function(e) {
            self.lastOperationTime = new Date();
        }, true);
        $e(this.wnpWindow).addEventListener('focus', function() {
            self.lastOperationTime = new Date();
        }, false);
        $e(this.wnpWindow).addEventListener('resize', function() {
            self.lastOperationTime = new Date();
        }, false);
        $e(this.wnpWindow).addEventListener('blur', function() {
            if (self.isAlwaysOnTop) {
                self.wnpWindow.setTimeout(function() {
                    self.wnpWindow.focus();
                }, 500);
            }
        }, false);
        var list = d.getElementById('WNP_PLAYLIST_ITEMS');
        var listUtil = new ListUtil(list);
        listUtil.ondragstart = function() {
            appendClass(list, 'dragging');
        };
        listUtil.ondragend = function() {
            removeClass(list, 'dragging');
            self.updatePlaylistURI();
        };
        listUtil.onselect = function() {
            self.selectionIterator.current(listUtil.selectedItems[0]);
        };
        listUtil.onitemover = function(item) {
            var playinfo = createPlayInfo(item);
            self.showStatus(playinfo.title[playinfo.items[0]], 5);
        };
        listUtil.onitemout = function(item) {
            self.clearStatus();
        };
        this.listUtil = listUtil;
    };
    WNP.prototype.seek = function(time) {
        this.wnpCore.seek(time);
        this.scheduleCancel(); // avoid mistype.
        this.clearStatus();
        if (time != Number.NEGATIVE_INFINITY) {
            this.showControlPanel();
        }
        else {
            // delay.
            var self = this;
            this.wnpWindow.setTimeout(function(){ self.showControlPanel(); }, 10);
        }
    };
    WNP.prototype.volume = function(vol) {
        this.wnpCore.volume(vol);
        this.scheduleCancel(); // avoid mistype.
        this.clearStatus();
        this.showControlPanel();
    };
    WNP.prototype.showControlPanel = function() {
        if (this.controlPanelTid) {
            this.wnpWindow.clearTimeout(this.controlPanelTid);
        }
        this.updateControlPanelStatus();
        var controlPanel = this.wnpWindow.document.getElementById('WNP_CONTROL_PANEL');
        controlPanel.style.visibility = 'visible';
        this.controlPanelTid = this.wnpWindow.setTimeout(function(){
            controlPanel.style.visibility = '';
        }, 3000);
    };
    WNP.prototype.hideControlPanel = function() {
        if (this.controlPanelTid) {
            this.wnpWindow.clearTimeout(this.controlPanelTid);
        }
        var controlPanel = this.wnpWindow.document.getElementById('WNP_CONTROL_PANEL');
        controlPanel.style.visibility = 'hidden';
    };
    WNP.prototype.updateControlPanelStatus = function() {
        var cur = this.wnpCore.current();
        var len = this.wnpCore.length();
        this.wnpWindow.document.getElementById('WNP_C_NICO_SEEKBAR').firstChild.firstChild.style.width = Math.ceil(cur / len * 100) + '%';
        var vol = this.wnpCore.volume();
        this.wnpWindow.document.getElementById('WNP_C_NICO_VOLUMEBAR').firstChild.firstChild.style.width = Math.ceil(vol / 100 * 100) + '%';
    };
    WNP.prototype.observeStatusTimerStart = function() {
        this.observeStatusTimerStop();
        var self = this;
        this.observeControlStatusTid = this.wnpWindow.setInterval(function() {
            self.updateControlPanelStatus();
        }, 1000);
    };
    WNP.prototype.observeStatusTimerStop = function() {
        if (this.observeControlStatusTid) {
            this.wnpWindow.clearInterval(this.observeControlStatusTid);
        }
        this.updateControlPanelStatus();
    };
    WNP.prototype.restoreControlPanel = function() {
        if (this.controlPanelTid) {
            this.wnpWindow.clearTimeout(this.controlPanelTid);
        }
        var controlPanel = this.wnpWindow.document.getElementById('WNP_CONTROL_PANEL');
        controlPanel.style.visibility = '';
    };
    WNP.prototype.setLoop = function(loop) {
        this.isLoop = loop;
        var button = this.wnpWindow.document.getElementById('WNP_C_NICO_LOOP');
        this.wnpCore.setRepeat(this.isLoop);
        if (this.isLoop) appendClass(button, 'loop');
        else             removeClass(button, 'loop');
    };
    WNP.prototype.setCommentOff = function(off) {
        this.isCommentOff = off;
        var button = this.wnpWindow.document.getElementById('WNP_C_NICO_COMM');
        this.wnpCore.setCommentOff(this.isCommentOff);
        if (this.isCommentOff) appendClass(button, 'comment_off');
        else                   removeClass(button, 'comment_off');
    };
    WNP.prototype.setMute = function(mute) {
        var button = this.wnpWindow.document.getElementById('WNP_C_NICO_MUTE');
        this.wnpCore.setMute(mute);
        if (mute) appendClass(button, 'mute');
        else      removeClass(button, 'mute');
    };
    WNP.prototype.setAlwaysOnTop = function(alwaysOnTop) {
        this.isAlwaysOnTop = alwaysOnTop;
        var button = this.wnpWindow.document.getElementById('WNP_C_ALWAYS_ON_TOP');
        if (this.isAlwaysOnTop) appendClass(button, 'always_on_top');
        else                    removeClass(button, 'always_on_top');
    };
    WNP.prototype.setPlaylistStyleSimple = function(simple) {
        if (!this._simplePlaylistStyle) {
            var simple_style_str = [
                'ul.wnp_playlist_items li div.video_info img.thumbnail { display: none }',
                'ul.wnp_playlist_items li div.video_info { width: 10px }',
                'ul.wnp_playlist_items li { height: 25px }',
                'ul.wnp_playlist_items li div.video_desc * { display: none }',
                'ul.wnp_playlist_items li div.video_desc a { display: inline }',
            ].join('\n');
            var style = addStyle(simple_style_str, this.wnpWindow.document);
            this._simplePlaylistStyle = style;
        }
        this._simplePlaylistStyle.disabled = !simple;
        this.wnpWindow.document.getElementById('WNP_C_PLAYLIST_STYLE').checked = simple;
    };
    WNP.prototype.menuToggle = function() {
        if (this.isMenuShowing) this.menuHide();
        else                    this.menuShow();
    };
    WNP.prototype.menuShow = function() {
        var menu = this.wnpWindow.document.getElementById('WNP_MENU');
        var view = this.wnpWindow.document.getElementById('WNP_VIEW');
        menu.style.borderRightWidth = '5px'; // for Opera9.5
        menu.style.width = this.menuWidthRatio + '%';
        view.style.width = (100-this.menuWidthRatio) + '%';
        this.isMenuShowing = true;
    };
    WNP.prototype.menuHide = function() {
        var menu = this.wnpWindow.document.getElementById('WNP_MENU');
        var view = this.wnpWindow.document.getElementById('WNP_VIEW');
        menu.style.borderRightWidth = '0'; // for Opera9.5
        menu.style.width = '0';
        view.style.width = '100%';
        this.isMenuShowing = false;
    };
    WNP.prototype.add = function(newList) {
        if (!newList) return;
        var playlist = this.playlist;
        var meta = ['video', 'title', 'image'];
        for (var i = 0; i < meta.length; i++) {
            var info = newList[meta[i]];
            for (var prop in info) {
                if (info[prop]) playlist[meta[i]][prop] = info[prop];
            }
        }
        //playlist.items = playlist.items.concat(newList.items); // Opera didn't handle Array of other window as Array.
        for (var i = 0; i < newList.items.length; i++) {
            var videoid = newList.items[i];
            playlist.items.push(videoid);
            this.addPlaylist({
                videoid : videoid,
                url     : playlist.video[videoid],
                title   : playlist.title[videoid],
                image   : playlist.image[videoid]
            });
        }
        this.updatePlaylistURI();
    };
    WNP.prototype.addURL = function(url, start) {
        try {
            var self = this;
            var loader = this.wnpWindow.document.createElement('iframe');
            loader.src = url;
            loader.style.display = 'none';
            $e(loader).addEventListener('load', function() {
                var startPoint = self.playlist.items.length;
                var playlist = createPlayInfo(loader.contentWindow.document.documentElement);
                self.add(playlist);
                self.wnpElement.removeChild(loader);
                if (start) self.wnpWindow.setTimeout(function(){ self.play(startPoint) }, 0); // delay for firefox.
            }, false);
            this.wnpElement.appendChild(loader);
        }
        catch (e) {
            this.wnpWindow.alert(e);
        }
    };
    WNP.prototype.clear = function() {
        this.playlist = {items: [], video: {}, title: {}, image: {} };
        var ul = this.wnpWindow.document.getElementById('WNP_PLAYLIST_ITEMS');
        while(ul.lastChild) ul.removeChild(ul.lastChild);
        this.updatePlaylistURI();
    };
    WNP.prototype.addPlaylist = function(info) {
        var wnpDocument = this.wnpWindow.document;
        var ul = wnpDocument.getElementById('WNP_PLAYLIST_ITEMS');
        var li = wnpDocument.createElement('li');
        var url = info.url;
        if (!url) url = 'http://www.nicovideo.jp/watch/' + info.videoid;
        var title = info.title || info.videoid;
        var thumbnail = info.image || 'http:\/\/tn-skr1.smilevideo.jp/smile?i=' + info.videoid.slice(2);
        li.innerHTML = [
            '<div class="video_info">',
            '  <span class="playmark">\u25C6</span>',
            '  <a href="' + url + '" title="' + title + '" target="nico_frame">',
            '    <img class="thumbnail" name="' + info.videoid + '" src="' + thumbnail + '" width="65" height="50" alt="' + title + '">',
            '  </a>',
            '</div>',
            '<div class="video_desc">',
            '  <a href="' + url + '" name="' + info.videoid + '" title="' + title + '" target="nico_frame">' + title + '</a><br>',
            '  <button>\u00D7</button>',
            '</div>',
        ].join('');
        ul.appendChild(li);
        var self = this;
        var playThis = function(e) {
            self.play(self.playlistIterator.indexOf(li));
            e.preventDefault();
        };
        var ancs = li.getElementsByTagName('a');
        for (var i = 0; i < ancs.length; i++) {
            $e(ancs[i]).addEventListener('click', playThis, false);
        }
        var desc = li.lastChild;
        $e(desc.getElementsByTagName('button')[0]).addEventListener('click', function(e) {
            ul.removeChild(li);
            self.updatePlaylistURI();
            e.preventDefault();
        }, false);
    };
    WNP.prototype.updatePlaylistURI = function() {
        var wnpDocument = this.wnpWindow.document;
        var items = wnpDocument.getElementById('WNP_PLAYLIST_ITEMS');
        var playlist = { items : [], video : {}, title : {}, image : {} };
        var itr = new ListElementIterator(items).first();
        while (itr.item) {
            var playinfo = createPlayInfo(itr.item);
            var videoid = playinfo.items[0];
            playlist.items.push(videoid);
            playlist.title[videoid] = playinfo.title[videoid];
            playlist.image[videoid] = playinfo.image[videoid];
            itr.next();
        }
        this.playlist = playlist;
        var save = wnpDocument.getElementById('WNP_C_PLAYLIST_URI');
        save.href = 'javascript:' + encodeURIComponent(WNP_GLOBAL_NAME + '.open(' + toJSON(playlist) + ')');
        var date = new Date();
        save.title = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + '.pls';
        save.firstChild.alt = save.title;
        this.updatePrevAndNext();
        this.lastUpdate = new Date();
    };
    WNP.prototype.updatePrevAndNext = function() {
        var wnpDocument = this.wnpWindow.document;
        var currentItem = this.playlistIterator.item;
        var itr = new ListElementIterator(wnpDocument.getElementById('WNP_PLAYLIST_ITEMS'));
        if (itr.previous(currentItem).item) {
            var prevInfo = createPlayInfo(itr.item);
            wnpDocument.getElementById('WNP_C_PREV').href = prevInfo.video[prevInfo.items[0]];
        }
        else {
            wnpDocument.getElementById('WNP_C_PREV').href = 'about:blank';
        }
        if (itr.next(currentItem).item) {
            var nextInfo = createPlayInfo(itr.item);
            wnpDocument.getElementById('WNP_C_NEXT').href = nextInfo.video[nextInfo.items[0]];
        }
        else{
            wnpDocument.getElementById('WNP_C_NEXT').href = 'about:blank';
        }
    };
    WNP.prototype.playToggle = function() {
        if (this.wnpCore.isPlaying) this.stop();
        else {
            if (!this.playlistIterator.item) {
                this.playlistIterator.first();
            }
            this.play();
        }
    };
    WNP.prototype.pauseToggle = function() {
        if (!this.wnpCore.isPlaying) {
            this.playToggle();
            return;
        }
        var button = this.wnpWindow.document.getElementById('WNP_C_NICO_PAUSE');
        if (this.wnpCore.isPausing) {
            this.wnpCore.resume();
            button.textContent = '||';
            button.style.fontSize = '';
            button.style.marginTop = '';
        }
        else {
            this.wnpCore.pause();
            button.textContent = '\u25BA';
            button.style.fontSize = '20px';
            button.style.marginTop = '0';
        }
    };
    WNP.prototype.scrollPlaylistTo = function(item) {
        if (this.scrollSoar != null) {
            this.scrollSoar.cancel();
        }
        var list = this.wnpWindow.document.getElementById('WNP_PLAYLIST_ITEMS');
        this.scrollSoar = new Soar(list);
        this.scrollSoar.to({scrollTop: Math.min(item.offsetTop, list.scrollHeight - list.clientHeight)}).go(this.wnpWindow);
        var self = this;
        this.scrollSoar.onFinish = function() {
            self.scrollSoar = null;
        };
    };
    WNP.prototype.play = function(index) {
        if (this.playingItem) {
            removeClass(this.playingItem, 'playing');
            this.playingItem = null;
        }
        var currentItem = this.playlistIterator.item;
        if (arguments.length > 0) {
            currentItem = this.playlistIterator.index(index).item;
        }
        if (!currentItem) {
            this.stop();
            return;
        }
        var playinfo = createPlayInfo(currentItem);
        var id = playinfo.items[0];
        var url = playinfo.video[id];
        var title = playinfo.title[id];
        var image = playinfo.image[id];
        var videoinfo = {
            id    : id,
            url   : url,
            title : title,
            thumbnail : image
        };

        this.scheduleCancel();

        var self = this;
        this.wnpWindow.setTimeout(function() {
            self.wnpCore.play(videoinfo);
            if (title) {
                self.wnpWindow.document.title = title + ' - ' + WNP_TITLE;
                self.showStatus(title, 5);
            }
        }, 500); // for smooth scroll.
        this.setAlternativeView(videoinfo);

        // timeout, etc.
        if (this.timeoutTid) this.wnpWindow.clearTimeout(this.timeoutTid);
        this.timeoutTid = this.wnpWindow.setTimeout(function() {
            self.showStatus("load timeout. go to next.", 5);
            self.next();
        }, WNP_PAGE_TIMEOUT * 1000 + 500);
        this.wnpCore.onload = function() {
            self.wnpWindow.clearTimeout(self.timeoutTid);
            self.timeoutTid = self.wnpWindow.setTimeout(function() {
                self.showStatus("play timeout. go to next.", 5);
                self.next();
            }, WNP_VIDEO_TIMEOUT * 1000);
            // show actual title.
            if (!title || title == id) {
                title = self.wnpCore.videoinfo.title;
                self.wnpWindow.document.title = title + ' - ' + WNP_TITLE;
                self.showStatus(title, 5);
            }
            // update title and thumbnail image.
            var video_id = self.wnpCore.videoinfo.v;
            var thumbnail = self.wnpCore.videoinfo.thumbnail;
            var elements = self.wnpWindow.document.getElementsByName(video_id);
            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                if (/img/i.test(el.nodeName)) {
                    if (el.src != thumbnail) el.src = thumbnail;
                    el.setAttribute('alt', title);
                }
                if (/a/i.test(el.nodeName)) {
                    el.setAttribute('title', title);
                    el.textContent = title;
                }
            }
            self.updatePlaylistURI();
        };
        this.wnpCore.onstart = function() {
            self.wnpWindow.clearTimeout(self.timeoutTid);
            self.observeStatusTimerStart();
        };
        this.wnpCore.onerror = function() {
            self.showStatus('this video is deleted. go to next.', 5);
            self.next();
        };
        this.wnpCore.onfinish = function() {
            self.observeStatusTimerStop();
            if ((new Date() - (self.lastOperationTime || 0)) > WNP_OFFTIMER * 60 * 1000) {
                self.stop();
            }
            else {
                self.next();
            }
        };

        appendClass(this.wnpElement, 'playing');
        appendClass(currentItem, 'playing');
        this.playingItem = currentItem;

        this.updatePrevAndNext();
        if ((new Date() - (this.lastOperationTime || 0)) > 10000) {
            this.scrollPlaylistTo(currentItem);
        }
    };
    WNP.prototype.stop = function() {
        this.scheduleCancel();
        var wnpDocument = this.wnpWindow.document;
        wnpDocument.title = WNP_TITLE;
        removeClass(this.wnpElement, 'playing');
        this.wnpCore.stop();
    };
    WNP.prototype.prev = function() {
        this.playlistIterator.previous();
        this.play();
    };
    WNP.prototype.next = function() {
        if (this.isLoop) this.playlistIterator.next().isNullThenFirst();
        else             this.playlistIterator.next();
        this.play();
    };
    WNP.prototype.schedulePrev = function() {
        if (!this.scheduleIterator) {
            this.scheduleIterator = new ListElementIterator(this.wnpWindow.document.getElementById('WNP_PLAYLIST_ITEMS'));
            this.scheduleIterator.current(this.playlistIterator.item);
        }
        this.scheduleIterator.previous().isNullThenFirst();
        this.schedulePlay();
    };
    WNP.prototype.scheduleNext = function() {
        if (!this.scheduleIterator) {
            this.scheduleIterator = new ListElementIterator(this.wnpWindow.document.getElementById('WNP_PLAYLIST_ITEMS'));
            this.scheduleIterator.current(this.playlistIterator.item);
            this.scheduleIterator.next().isNullThenFirst();
        }
        else {
            this.scheduleIterator.next().isNullThenLast();
        }
        this.schedulePlay();
    };
    WNP.prototype.schedulePlay = function() {
        if (!this.scheduleIterator) return;
        if (this.scheduleTid != null) this.wnpWindow.clearTimeout(this.scheduleTid);
        var playinfo = createPlayInfo(this.scheduleIterator.item);
        this.showStatus("next: " + playinfo.title[playinfo.items[0]], 3);
        var self = this;
        this.scheduleTid = this.wnpWindow.setTimeout(function() {
            self.scheduleTid = null;
            if (self.playlistIterator.item == self.scheduleIterator.item) {
                self.scheduleIterator = null;
                return;
            }
            self.playlistIterator.current(self.scheduleIterator.item);
            self.scheduleIterator = null;
            self.play();
        }, 3000);
    };
    WNP.prototype.scheduleCancel = function() {
        if (this.scheduleTid != null) {
            this.wnpWindow.clearTimeout(this.scheduleTid);
            this.showStatus("cancel.", 3);
        }
        this.scheduleTid = null;
        this.scheduleIterator = null;
    };
    WNP.prototype.layoutToggle = function() {
        switch (this.wnpCore.style) {
        case WNPCore.STYLE_FILL:    this.wnpCore.restoreView();     break;
        case WNPCore.STYLE_RESTORE: this.wnpCore.alternativeView(); break;
        default:                    this.wnpCore.fillView();        break;
        }
    };
    WNP.prototype.clearStatus = function() {
        var statusBar = this.wnpWindow.document.getElementById('WNP_STATUS_BAR');
        statusBar.textContent = '';
    };
    WNP.prototype.showStatus = function(msg, sec, error) {
        var statusBar = this.wnpWindow.document.getElementById('WNP_STATUS_BAR');
        if (this.statusTid != null) {
            this.wnpWindow.clearTimeout(this.statusTid);
            this.statusTid = null;
        }
        if (error) appendClass(statusBar, 'error');
        else       removeClass(statusBar, 'error');
        this.hideControlPanel();
        statusBar.textContent = msg;
        if (sec) {
            var self = this;
            this.statusTid = this.wnpWindow.setTimeout(function(){
                statusBar.textContent = '';
                self.restoreControlPanel();
            }, sec * 1000);
        }
    };
    WNP.prototype.setAlternativeView = function(videoinfo) {
        var thmb_url = videoinfo.thumbnail || 'about:blank';
        var title    = videoinfo.title || videoinfo.id || '';
        title = escapeHTML(title);
        var total = this.playlistIterator.count();
        var current = this.playlistIterator.indexOf(this.playlistIterator.item) + 1;
        var svg_xml = svg_xml_base.replace(/%u/g, thmb_url).replace(/%t/g, title).replace(/%c/g, current + ' / ' + total);
        var svg_url = 'data:' + svg_mime_type + ';charset=utf-8,' + encodeURIComponent(svg_xml);
        var iframe = this.wnpWindow.document.createElement('iframe');
        iframe.src = svg_url;
        this.wnpCore.setAlternativeView(iframe, 380, 230);
    };

    window[WNP_GLOBAL_NAME] = WNP;

    var tooltip = null;
    var tooltipTid = null;
    var currentpls = null;
    function showToolTipIfNecessary(target) {

        var a = target;
        while(a) {
            if (/a/i.test(a.nodeName)) break;
            a = a.parentNode;
        }
        if (!a) return;

        if (/^http:\/\/www\.nicovideo\.jp\/watch\/(\w+)/.test(a.href)) {
            var id = RegExp.$1;
            var url = a.href;
            var title = guessTitle(a);
            var img = $XS('//a[contains(@href,"/' + id + '")]/img');
            var thumbnail = (img) ? img.src : 'http://tn-skr.smilevideo.jp/smile?i=' + id.slice(2);
            currentpls = { items: [id], video: {}, title: {}, image: {} };
            currentpls.video[id] = url;
            currentpls.title[id] = title;
            currentpls.image[id] = thumbnail;
        }
        else if (/^http:\/\/www\.nicovideo\.jp\/.*/.test(a.href)) {
            currentpls = a.href;
        }
        else {
            return;
        }

        if (!tooltip) {
            tooltip = document.createElement('div');
            appendClass(tooltip, 'wnp_tooltip');
            tooltip.innerHTML = '<a href="javascript:void(0)" rel="nofollow">play</a><a href="javascript:void(0)">add</a>';
            if (moz) { // Ha!
                tooltip.innerHTML = [
                    '<a href="javascript:void(0)" rel="nofollow"><img src="about:blank" style="display:none"><br style="display:none">play</a>',
                    '<a href="javascript:void(0)" rel="nofollow"><img src="about:blank" style="display:none"><br style="display:none">add</a>'
                ].join('');
            }
            tooltip.style.cssText = 'position: absolute; display: none; opacity: 0.4; z-index: 999; ';
            $e(tooltip).addEventListener('mouseover', function(e) {
                tooltip.style.opacity = '1';
                e.stopPropagation();
            }, false);
            $e(tooltip).addEventListener('mouseout', function(e) {
                tooltip.style.opacity = '0.4';
                e.stopPropagation();
            }, false);
            $e(tooltip.childNodes[0]).addEventListener('click', function(e) {
                if (currentpls) WNP.open(currentpls);
                e.preventDefault();
            }, false);
            $e(tooltip.childNodes[1]).addEventListener('click', function(e) {
                if (currentpls) WNP.add(currentpls);
                e.preventDefault();
            }, false);
            document.getElementsByTagName('body')[0].appendChild(tooltip);
        }

        var play_href = 'javascript:' + encodeURIComponent('void((window.' + WNP_GLOBAL_NAME + ')?' + WNP_GLOBAL_NAME + '.open(' + toJSON(currentpls) + '):location.href=\'' + a.href +'\')');
        var add_href = 'javascript:' + encodeURIComponent('void((window.' + WNP_GLOBAL_NAME + ')?' + WNP_GLOBAL_NAME + '.add(' + toJSON(currentpls) + '):location.href=\'' + a.href +'\')');
        var title = guessTitle(a) + ' - \u30CB\u30B3\u30CB\u30B3\u52D5\u753B';

        var opener = tooltip.childNodes[0];
        opener.setAttribute('href', play_href);
        opener.setAttribute('title', title);
        var adder = tooltip.childNodes[1];
        adder.setAttribute('href', add_href);
        adder.setAttribute('title', title);

        if (moz) {
            opener.firstChild.setAttribute('alt', title);
            adder.firstChild.setAttribute('alt', title);
        }

        var p = getAbsolutePosition(a);
        var x = p.x, y = p.y,
            w = a.offsetWidth, h = a.offsetHeight,
            width  = 80, height = 25;
        if (moz) {
            var thumb = a.getElementsByTagName('img')[0];
            if (thumb) {
                var p = getAbsolutePosition(thumb);
                x = Math.min(x, p.x);
                y = Math.min(y, p.y);
                w = Math.max(w, thumb.offsetWidth);
                h = Math.max(h, thumb.offsetHeight);
            }
        }
        tooltip.style.left = Math.min(Math.max(x + Math.min(20, w-5), (x + w - width)), window.innerWidth - 125) + 'px';
        tooltip.style.top  = Math.min(y - 10, y + (h / 2) - 15 - height)  + 'px';
        tooltip.style.display = 'block';

        if (tooltipTid) clearTimeout(tooltipTid);
        tooltipTid = setTimeout(function() {
            tooltip.style.display = 'none';
            tooltipTid = null;
            currentpls = null;
        }, 3500);
    }
    function showControlPanel() {
        var controlPanel = document.createElement('div');
        appendClass(controlPanel, 'wnp_tooltip');
        controlPanel.style.cssText = 'position: fixed; bottom: 5px; right: 5px; width: 150px; z-index: 998; ';
        var play_href = 'javascript:' + encodeURIComponent('void((window.' + WNP_GLOBAL_NAME + ')?' + WNP_GLOBAL_NAME + '.open(\'' + location.href + '\'):location.href=\'' + location.href + '\')');
        var add_href = 'javascript:' + encodeURIComponent('void((window.' + WNP_GLOBAL_NAME + ')?' + WNP_GLOBAL_NAME + '.add(\'' + location.href + '\'):location.href=\'' + location.href + '\')');
        var title = document.title;
        var panel_html = [
            '<span title="open WNP">open</span>',
            '<a href="' + play_href + '" title="' + title + '" rel="nofollow">play</a>',
            '<a href="' + add_href + '" title="' + title + '" rel="nofollow">add</a>',
        ].join('');
        if (moz) {
            panel_html = [
                '<span title="open WNP">open</span>',
                '<a href="' + play_href + '" title="' + title + '" rel="nofollow"><img src="about:blank" style="display:none" alt="' + title + '"><br style="display:none">play</a>',
                '<a href="' + add_href + '" title="' + title + '" rel="nofollow"><img src="about:blank" style="display:none" alt="' + title + '"><br style="display:none">add</a>',
            ].join('');
        }
        if (window.parent == window) {
            panel_html +=
            '<span style="width:55px" title="open miniTV">miniTV</span>';
            controlPanel.style.width = '225px';
        }
        controlPanel.innerHTML = panel_html;
        document.getElementsByTagName('body')[0].appendChild(controlPanel);
        $e(controlPanel.childNodes[0]).addEventListener('click', function(e) {
           WNP.wnp();
           e.preventDefault();
        }, false);
        $e(controlPanel.childNodes[1]).addEventListener('click', function(e) {
           WNP.open();
           e.preventDefault();
        }, false);
        $e(controlPanel.childNodes[2]).addEventListener('click', function(e) {
           WNP.add();
           e.preventDefault();
        }, false);
        if (window.parent == window) {
            $e(controlPanel.childNodes[3]).addEventListener('click', function() {
                minitv();
            }, false);
        }
    }

    function MiniTV (document){
        this.document = document || window.document;
        this.build();
        this.isShowing = true;
        this.isPlaying = false;
    }
    MiniTV.prototype = {
        build : function() {
            var document = this.document;
            document.write(minitv_html);
            if (!document.defaultView.opera) document.close();
            this.wnpCore = new WNPCore(document, 'minitv');
            document.getElementById('MINITV_CONTAINER').appendChild(this.wnpCore.element);
            var self = this;
            $e(document.getElementById('MINITV_C_OPEN')).addEventListener('click', function(e) {
                self.stop();
                var mainFrame = document.getElementById('MAIN_FRAME');
                if (!mainFrame.contentWindow) return;
                if (mainFrame.contentWindow.WNP) {
                    mainFrame.contentWindow.WNP.add({items:[]});
                }
            }, false);
            $e(document.getElementById('MINITV_C_PLAY')).addEventListener('click', function(e) {
                self.stop();
                var mainFrame = document.getElementById('MAIN_FRAME');
                if (!mainFrame.contentWindow) return;
                if (mainFrame.contentWindow.WNP) {
                    mainFrame.contentWindow.WNP.open();
                }
            }, false);
            $e(document.getElementById('MINITV_C_ADD')).addEventListener('click', function(e) {
                self.stop();
                var mainFrame = document.getElementById('MAIN_FRAME');
                if (!mainFrame.contentWindow) return;
                if (mainFrame.contentWindow.WNP) {
                    mainFrame.contentWindow.WNP.add();
                }
            }, false);
            $e(document.getElementById('MINITV_C_SHOW')).addEventListener('click', function(e) {
                self.setShowing(!self.isShowing);
            }, false);
            $e(document.getElementById('MINITV_C_STOP')).addEventListener('click', function(e) {
                self.stop();
            }, false);
            $e(document.getElementById('MINITV_C_CONT')).addEventListener('click', function(e) {
                self.wnpCore.setControlShowing(!self.wnpCore.isControlShowing);
            }, false);
            $e(document.getElementById('MINITV_C_SCRE')).addEventListener('click', function(e) {
                self.layoutToggle();
            }, false);
            $e(document.getElementById('MINITV_C_SIZE')).addEventListener('change', function(e) {
                self.setSize(e.currentTarget.value);
            }, false);
            $e(document.getElementById('WNP_FOOTER')).addEventListener('click', function(e) {
                self.wnpCore.setControlShowing(!self.wnpCore.isControlShowing);
            }, false);
            $e(document).addEventListener('keypress', function(e) {
                if (e.keyCode == 27) { // Esc
                }
                if (e.keyCode == 38) { // up
                }
                if (e.keyCode == 40) { // down
                }
                if (e.keyCode == 39) { // right
                    self.wnpCore.seek(15);
                    e.preventDefault();
                }
                if (e.keyCode == 37) { // left
                    if (e.ctrlKey) self.wnpCore.seek(Number.NEGATIVE_INFINITY);
                    else           self.wnpCore.seek(-15);
                    e.preventDefault();
                }
            }, false);
            this.observeLocation();
        },
        play : function(href) {
            var video_id = href.match(/[^/]+$/);
            var pl = createPlayInfo(this.document.getElementById('MAIN_FRAME').contentWindow.document);
            if (pl.image[video_id]) {
                this.wnpCore.play({ id: video_id, url: href, thumbnail: pl.image[video_id] });
            }
            else {
                this.wnpCore.play(href);
            }
            this.isPlaying = true;
            this.setShowing(true);
            var self = this;
            this.wnpCore.onload = function() {
                var title = self.wnpCore.videoinfo.title;
                self.document.title = title + ' - ' + MINITV_TITLE;
            };
            this.wnpCore.onerror = function() {
                //
            };
            this.wnpCore.onfinish = function() {
                //
            };
        },
        stop : function() {
            this.isPlaying = false;
            this.wnpCore.stop();
            self.document.title = MINITV_TITLE;
        },
        setSize: function(sizeId) {
            this.sizeId = sizeId;
            if (!this.isShowing) return;
            var document = this.document;
            var container = document.getElementById('MINITV_CONTAINER');
            switch (sizeId) {
            case '1' :
                container.style.top = container.style.left = '';
                container.style.width = '';
                container.style.height = '';
                container.style.paddingBottom = '';
                break;
            case '2' :
                container.style.top = container.style.left = '';
                container.style.width = '600px';
                container.style.height = '460px';
                container.style.paddingBottom = '';
                break;
            case 'full' :
                container.style.top = container.style.left = '0';
                container.style.width = '100%';
                container.style.height = '100%';
                container.style.paddingBottom = '30px';
                break;
            }
        },
        setShowing : function(show) {
            var view = this.document.getElementById('MINITV_CONTAINER');
            var button = this.document.getElementById('MINITV_C_SHOW');
            if (show) {
                this.isShowing = true;
                this.setSize(this.sizeId || '1');
                button.innerHTML = 'hide';
            }
            else {
                this.isShowing = false;
                view.style.width = '0'; view.style.height = '0';
                button.innerHTML = 'show';
            }
        },
        layoutToggle : function() {
            switch (this.wnpCore.style) {
            case WNPCore.STYLE_FILL:    this.wnpCore.restoreView();     break;
            case WNPCore.STYLE_RESTORE: this.wnpCore.alternativeView(); break;
            default:                    this.wnpCore.fillView();        break;
            }
        },
        observeLocation: function() {
            var document = this.document;
            if (this.observeTid) {
                document.defaultView.clearTimeout(this.observeTid);
            }
            var self = this;
            this.observeTid = document.defaultView.setInterval(function() {
                var mainFrame = document.getElementById('MAIN_FRAME');
                if (!mainFrame.contentWindow) return;
                if (!mainFrame.contentWindow.document) return;
                var doc = mainFrame.contentWindow.document;
                try {
                    if (!doc.documentElement) return;
                    var docEl = doc.documentElement;
                    if (hasClass(docEl, 'minitv_minitv')) {
                        return;
                    }
                    appendClass(docEl, 'minitv_minitv');
                    $e(docEl).addEventListener('click', function(e) {
                        var target = e.target;
                        while (target) {
                            if (/a/i.test(target.nodeName)) break;
                            target = target.parentNode;
                        }
                        if (!target) return;
                        if (!target.href) return;
                        if (!/^http/.test(target.href)) return;
                        if (!/^http:\/\/www\.nicovideo\.jp\/.*/.test(target.href)) {
                            target.setAttribute('target', '_blank');
                            return;
                        }
                        if (target.getAttribute('target') == '_top') {
                            target.removeAttribute('target');
                        }
                        if (/^http:\/\/www\.nicovideo\.jp\/watch\/.*/.test(target.href)) {
                            target.setAttribute('target', 'minitv');
                            self.play(target.href);
                            e.preventDefault();
                        }
                    }, false);
                }
                catch (e) {
                }
            }, 1000);
        }
    }

    function minitv() {
        window.parent.miniTV = new MiniTV(document);
    }

    function main() {
        addStyle(page_style);
        var miniTV = false;
        try {
            if (window.parent.miniTV) {
                miniTV = true;
            }
        }
        catch (e) {} // security exception.
        if (!miniTV) {
            showControlPanel();
        }
        $e(document).addEventListener('mouseover', function(e) {
            if (!miniTV || !window.parent.miniTV.isShowing) {
                showToolTipIfNecessary(e.target);
            }
        }, false);
        if (miniTV) {
            if (window.jumpMENU) {
                var orgFunc = window.jumpMENU;
                window.jumpMENU = function(a, b, c) {
                    orgFunc('window', b, c);
                }
            }
        }
    }

    /*
    if (location.pathname == '/wnp') {
        if (document.getElementById('WNP_PLAYER')) return;
        var item = location.hash;
        if (item) item = decodeURIComponent(item.slice(1));
        document.close();
        var wnp = new WNP(window);
        WNP.wnp = function() {
            return wnp;
        }
        WNP.open(item);
        return;
    }
    */
    if (window.wnp) return; // for Firefox.
    if (document.getElementsByTagName('body')[0]) {
        main();
    }
    else {
        if (window.opera) {
            document.addEventListener('DOMContentLoaded', main, false);
        }
        else {
            $e(window).addEventListener('load', main, false);
        }
    }
};

if (window.opera) {
    MAIN();
}
else {
    var script = document.createElement('script');
    script.setAttribute('type', 'text\/javascript');
    script.innerHTML = '(' + MAIN.toString() + ')()';
    document.getElementsByTagName('head')[0].appendChild(script);
    return;
}

})();
