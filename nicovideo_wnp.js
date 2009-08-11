// ==UserScript==
// @name        nicovideo - wnp
// @description windowised nicovideo player.
// @author      miya2000
// @namespace   http://d.hatena.ne.jp/miya2000/
// @version     1.0.0
// @include     http://www.nicovideo.jp/*
// @exclude     http://www.nicovideo.jp/watch/*
// @exclude     http://*http*
// ==/UserScript==
/*
 [usage]
 Open http://www.nicovideo.jp/
 and you can start with the right-bottom button on the page.

 @see http://d.hatena.ne.jp/kotas/20070925/playlist
      http://abc.s65.xrea.com/prox/wiki/%A5%D5%A5%A3%A5%EB%A5%BF%A1%A2%A5%EA%A5%B9%A5%C8%B8%F8%B3%AB/nicovideo/#iroiro
      http://blog.fulltext-search.biz/articles/2008/01/31/nico-nico-player-wrapper
      http://blog.guron.net/2009/06/04/636.php
*/
// ==== preparation ==== //
(function(f) {
    if (typeof unsafeWindow == "undefined") return f;
    return function() {
        var s = document.createElement('script');
        s.setAttribute('type', 'text/javascript');
        s.setAttribute('style', 'display: none;');
        s.textContent = '(' + f.toString() + ')()';
        (document.body || document.documentElement).appendChild(s);
    };
})
// ==== wnp ==== //
(function() {
    
    if (window.name == 'wnp') return;
    
    var WNP = {};
    
    // ==== Prefs ==== //
    WNP.Prefs = {
        WIDTH  : 610,  // startup window size.
        HEIGHT : 470,  //
        LOOP_ON_STARTUP : false,                   // "loop" on startup.
        COMMENT_OFF_ON_STARTUP : false,            // "comment-off" on startup.
        ALWAYS_ON_TOP_ON_STARTUP : false,          // "always on top" on startup.
        PLAYLIST_STYLE_SIMPLE_ON_STARTUP : false,  // "playlist style simple" on startup.
        REMOVE_ON_FINISH_ON_STARTUP : true,        // "remove on finish" on startup.
        USE_HISTORY_ON_STARTUP : true,             // "use history" on startup.
        SKIP_DELETED_MOVIE : true,                 // skip deleted movie.
        MENU_WIDTH_RATIO : 50,  // (%)   menu width ratio when showing menu.
        OBSERVE_INTERVAL : 500, // (ms)  observe interval.
        PAGE_TIMEOUT  : 80,     // (sec) page load timeout.
        VIDEO_TIMEOUT : 60,     // (sec) video play timeout.
        OFFTIMER      : 120,    // (min) off timer.
        LOOP_BREAK_COUNT : 3    // exit from loop video by specified count. 
    };
    
    // ==== const ==== //
    var Consts = {
        WNP_TITLE : 'WNP',
        WNP_GLOBAL_NAME : 'WNP',     // global name of WNP entry object.
        WNP_IMAGE_SAVE  : 'data:image/gif;base64,R0lGODlhEAAQAIAAAAAAAPD4%2FyH5BAEAAAAALAAAAAAQABAAAAIhhI%2Bpq%2BEPHYo0zAovlscy4BnhMo7N9IHoV6Ytq23pTAMFADs%3D',
        WNP_IMAGE_PLAY  : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAPCAYAAADkmO9VAAAAt0lEQVQ4y2NgoCL4%2F%2F8%2FXnnB0NBQFyAtQA0DJVatWtUPVHALRAP5kpQaqAmUvAzE%2F4D4OxDvB4rZAzE7uQZqASWvQA2EgSchISG5oKAgy4X%2F%2Fv27DMR%2Fgfg%2FDAPBm5UrV07AFQSkuvA%2FoSAgx0BkcAnkE3K8jAxgXn8CTFL56OFJjgvxxjipBr4BpskJ%2BNIkPgO1gV67geZFvEmGkIFKQMntQPyB2ERNTF6WAnoxjdhsR4yBZJU2AAcDLeBOG3M7AAAAAElFTkSuQmCC',
        WNP_IMAGE_PAUSE : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAPCAYAAADkmO9VAAAAe0lEQVQ4y2NgoCL4%2F%2F8%2FfgWhoaFuxIgRYyDLqlWrooAKfoJoEB%2BHGCOxBnIAJTf9h4BNID4OsYEzkP3fv38b%2F0HARhAfhxjDqJeHsJc5gN7aAdIJomEGYhEj2stsQMl2UGCBaBAfhxjRLgQDYBZrICBGmoG4NOISAxkIAIbuKTCbOZywAAAAAElFTkSuQmCC',
        WNP_IMAGE_EMPTY : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12P4DwQACfsD%2FWMmxY8AAAAASUVORK5CYII%3D',
        ORG_PLAYER_VIEW_WIDTH  : 544,
        ORG_PLAYER_VIEW_HEIGHT : 384,
        ORG_PLAYER_CONTROL_HEIGHT : 63,
        ORG_PLAYER_MINIMUM_WIDTH  : 561
    }
    WNP.Consts = Consts;
    Consts.svg_xml_base = [
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
        '    <image x="10" width="130" height="100" xlink:href="%u%" />',
        '    <image id="mirror" x="10" width="130" height="100" xlink:href="%u%" transform="matrix(1,0,0,-1,0,200)" />',
        '    <rect id="grad" y="100" width="150" height="100" fill="url(#liGrad)" />',
        '</g>',
        '<g clip-path="url(#clip_txt)" transform="translate(150,50)" font-family="Verdana,sans-serif" font-weight="bold">',
        '    <text y="30" style="font-size: 15px;">%t%',
        '        <animate attributeName="x" values="0;0;-300" keyTimes="0;0.25;1" dur="10s" repeatDur="indefinite" /> ',
        '    </text>',
        '    <text x="5" y="75" style="font-size: 12px;">%c%</text>',
        '    <g id="videoinfo" style="display: none">',
        '        <text x="5"  y="110" style="font-size: 10px;">\u518D\u751F</text>',
        '        <text x="60" y="110" style="font-size: 10px;" id="count">%vp%</text>',
//        '        <text x="5"  y="120" style="font-size: 10px;">\u30B3\u30E1\u30F3\u30C8</text>',
//        '        <text x="60" y="120" style="font-size: 10px;">%vc%</text>',
        '        <text x="5"  y="120" style="font-size: 10px;">\u30DE\u30A4\u30EA\u30B9\u30C8</text>',
        '        <text x="60" y="120" style="font-size: 10px;">%vm%</text>',
        '    </g>',
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
        '    if (document.getElementById("count").textContent.length > 0) {',
        '        document.getElementById("videoinfo").style.display = "";',
        '    }',
        ']]>',
        '</script>',
        '</svg>'
        ].join('\n');
    Consts.svg_mime_type = 'image/svg+xml';
    
    // ==== color settings ==== //
    var Colors = {
        item_hover:    '#D7EBFF',
        item_selected: '#B4DAFF',
        item_dragging: '#FFCCCC',
        status_error:  'red',
        control_loop: 'yellow',
        control_repeat: 'yellow',
        control_comment_off: 'yellow',
        control_mute: 'yellow',
        control_always_on_top: 'yellow'
    };
    WNP.Colors = Colors;
    
    // ==== main ==== //
    var fn = {};
    WNP.fn = fn;
    BUILD_FUNC(fn);
    var browser = fn.browser;
    var ie = fn.ie;
    var $e = fn.$e;
    var toJSON = fn.toJSON;
    var getAbsolutePosition = fn.getAbsolutePosition;
    var addStyle = fn.addStyle;
    var getStyle = fn.getStyle;
    var $XS = fn.$XS;
    var findVideoTitle = fn.findVideoTitle;
    var createPlayInfo = fn.createPlayInfo;
    WNP.html = function() { 
        var browser = WNP.fn.browser;
        var borderBox = browser.mozilla ? '-moz-box-sizing : border-box;' : browser.webkit ? '-webkit-box-sizing : border-box;' : '';
        return [
        '<!DOCTYPE html PUBLIC "-\/\/W3C\/\/DTD HTML 4.01 Transitional\/\/EN" "http:\/\/www.w3.org/TR/html4/loose.dtd">',
        '<html>',
        '<head>',
        '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
        '<meta http-equiv="Content-Script-Type" content="text/javascript">',
        '<meta http-equiv="Content-Style-Type" content="text/css">',
        '<meta http-equiv="X-UA-Compatible" content="IE=8">',
        '<title>' + Consts.WNP_TITLE + '</title>',
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
        '    box-sizing: border-box;', borderBox,
        '    width: 100%;',
        '    height: 20px;',
        '    color: #F0F8FF;',
        '    background-color: #050608;',
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
        '    box-sizing: border-box;', borderBox,
        '    width: 100%; height: 100%;',
        '    margin: -20px 0;',
        '    border: #050608 solid;',
        '    border-width: 20px 0;',
        '    z-index: 0;',
        '}',
        'div.wnp_menu {',
        '    box-sizing: border-box;', borderBox,
        '    position: absolute;',
        '    z-index: 0;',
        '    top: 0px;',
        '    right: 0;',
        '    width: 0;',
        '    height: 100%;',
        '    padding: 20px 0;',
        '    border-right: #050608 solid 0px;',
        '    overflow: hidden;',
        '}',
        'div.wnp_menu .wnp_menu_slider {',
        '    clear: both;',
        '    width: 15px;',
        '    height: 100%;',
        '    position: absolute;',
        '    top: 0; left: 0;',
        '    background-color: #696969;',
        '    opacity: 0.05;', /*@cc_on 'filter: alpha(opacity=5);', @*/
        '    z-index: 2;',
        '    cursor: e-resize;',
        '}',
        'div.wnp_menu .wnp_menu_slider:hover {',
        '    opacity: 0.6;', /*@cc_on 'filter: alpha(opacity=60);', @*/
        '}',
        'div.wnp_menu_container {',
        '    width: 500%;',
        '    height: 100%;',
        '}',
        'div.wnp_menu_content {',
        '    width: 20%;',
        '    height: 100%;',
        '    float: left;',
        '}',
        '.wnp_menu_header {',
        '    height: 19px;',
        '    border-bottom: #CCC solid 1px;',
        '    padding: 0 5px 0;',
        '    position: relative;',
        '    z-index: 1;',
        '    overflow: hidden;',
        '    background-color: #5E95FF;',
        '    color: #F0F0F0;',
        '    line-height: 18px;',
        '    font-size: 12px;',
        '    font-weight: bold;',
        '}',
        '.wnp_history_header {',
        '    background-color: #EA7DB0;',
        '}',
        'ul.wnp_playlist_items {',
        '    box-sizing: border-box;', borderBox,
        '    background-color: #D0DAEF;',
        '    list-style: none;',
        '    height: 100%;',
        '    position: relative;',
        '    z-index: 0;',
        '    overflow: auto;',
        '    border-style: solid;',
        '    border-width: 20px 0 20px;',
        '    margin-top: -20px;',
        '    margin-bottom: -20px;',
        '    border-right: #CCC solid 1px;',
        '}',
        '.wnp_menu_footer {',
        '    height: 19px;',
        '    border-top: #CCC solid 1px;',
        '    padding: 0 5px 0 0;',
        '    position: relative;',
        '    z-index: 1;',
        '    overflow: hidden;',
        '    background-color: #E7E7EF;',
        '    color: #000;',
        '    line-height: 18px;',
        '    font-size: 12px;',
        '}',
        '.wnp_menu_footer input[type="checkbox"] {',
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
        'ul.wnp_playlist_items li a[href]:hover {',
        '    background-color: #B0D0FF;',
        '}',
        'input, button {',
        '    font-size: 12px;',
        '    line-height: 1.1em;',
        '}',
        'div.wnp_footer span.wnp_status_bar {',
        '    color: white;',
        '    font-weight: normal;',
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
        'div.wnp_player ul.wnp_playlist_items li.playing .video_desc {',
        '    font-weight: bold;',
        '}',
        'div.wnp_player ul.wnp_playlist_items li.playing .playmark {',
        '    visibility: visible;',
        '}',
        'div.wnp_control_panel {',
        '    box-sizing: border-box;', borderBox,
        '    background-color: #050608;',
        '    margin-left: 20px;',
        '    visibility: hidden;',
        '    position: absolute;',
        '    top: 0; left: 0;',
        '    width: 100%;',
        '    height: 20px;',
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
        '    margin: 2px 0.2em 0;', browser.mozilla ? 'font-size: 12px; margin: 0 0.2em; ' : '',
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
        /*@cc_on 
        'ul.wnp_playlist_items > li {',
        '    overflow: hidden;',
        '}',
        'ul.wnp_playlist_items > li > div {',
        '    position: relative;',
        '}',
        'ul.wnp_playlist_items > li > img.wnp_iecover {',
        '    position: absolute;',
        '    left: 0;',
        '    width: 100%;',
        '    cursor: default;',
        '    height: 53px;',
        '    filter: alpha(opacity=1);',
        '}',
        @*/
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
        '            <button class="control" id="WNP_C_LOOP" title="Playlist Loop on/off(L)">\u221E</button>',
        '            <a class="control" id="WNP_C_PLAYLIST_URI" title="Save" href="about:blank"><img class="button" src="' + Consts.WNP_IMAGE_SAVE + '" alt=""></a>',
        '            <button class="control default_button" id="WNP_C_PLAYLIST" title="Show or Hide Playlist(N)">\u25BD</button>',
        '            <button class="control" id="WNP_C_HISTORY" title="Show or Hide History(H)">\u25BC</button>',
        '        </div>',
        '    </div>',
        '    <div class="wnp_view" id="WNP_VIEW"></div>',
        '    <div class="wnp_footer" id="WNP_FOOTER">',
        '        <button class="control default_button" title="Show Nicovideo Player Controls" id="WNP_C_NICO_MENU">\u25B3</button>',
        '        <span class="wnp_status_bar" id="WNP_STATUS_BAR"></span>',
        '        <div class="wnp_control_panel" id="WNP_CONTROL_PANEL">',
        '            <span class="wnp_button_container"><button class="control" title="Pause or Resume(Space)" id="WNP_C_NICO_PAUSE"><img src="' + Consts.WNP_IMAGE_PLAY + '"></button></span>',
        '            <div class="wnp_seekbar" id="WNP_C_NICO_SEEKBAR" title="Seek(Left/Right)"><div><div></div></div></div>',
        '            <div class="wnp_etcbar">',
        '                <span class="wnp_button_container"><button class="control" id="WNP_C_NICO_MUTE" title="Mute(M)">\u03BC</button></span>',
        '                <div class="wnp_volumebar" id="WNP_C_NICO_VOLUMEBAR" title="Volume(Up/Down)"><div><div></div></div></div>',
        '                <button class="control" id="WNP_C_NICO_COMM" title="Comment on/off(C)">\u24D2</button>',
        '                <button class="control" id="WNP_C_NICO_REPEAT" title="Repeat on/off(R)">\u03C3</button>',
        '            </div>',
        '        </div>',
        '    </div>',
        '    <div class="wnp_menu" id="WNP_MENU">',
        '        <div class="wnp_menu_slider" id="WNP_MENU_SLIDER"></div>',
        '        <div class="wnp_menu_container" id="WNP_MENU_CONTAINER">',
        '            <div class="wnp_menu_content" id="WNP_MENU_PLAYLIST">',
        '                <p class="wnp_menu_header">playlist</p>',
        '                <ul class="wnp_playlist_items" id="WNP_PLAYLIST_ITEMS"></ul>',
        '                <p class="wnp_menu_footer">',
        '                    <input id="WNP_C_PLAYLIST_STYLE" type="checkbox"><label for="WNP_C_PLAYLIST_STYLE">simple</label>',
        '                    <input id="WNP_C_REMOVE_ON_FINISH" type="checkbox"><label for="WNP_C_REMOVE_ON_FINISH">remove on finish</label>',
        '                </p>',
        '            </div>',
        '            <div class="wnp_menu_content" id="WNP_MENU_HISTORY">',
        '                <p class="wnp_menu_header wnp_history_header">history</p>',
        '                <ul class="wnp_playlist_items" id="WNP_HISTORY_ITEMS"></ul>',
        '                <p class="wnp_menu_footer">',
        '                    <input id="WNP_C_USE_HISTOPRY" type="checkbox"><label for="WNP_C_USE_HISTOPRY">use history</label>',
        '                </p>',
        '            </div>',
        '        </div>',
        '    </div>',
        '</div>',
        '<script type="text/javascript">' + BUILD_FUNC.toString() + '</script>',
        '<script type="text/javascript">' + BUILD_WNP.toString() + '</script>',
        '<script type="text/javascript">',
        '    var Consts = (' + toJSON(Consts) + ');',
        '    var Colors = (' + toJSON(Colors) + ');',
        '    BUILD_FUNC();',
        '    BUILD_WNP();',
        '</script>',
        '</body>',
        '</html>'
        ].join('\n');
    };
    WNP.pageStyle = function(pref) { 
        var browser = WNP.fn.browser;
        var borderBox = browser.mozilla ? '-moz-box-sizing : border-box;' : browser.webkit ? '-webkit-box-sizing : border-box;' : '';
        return [
        '.wnp_tooltip {',
        '    width: 168px;',
        '    opacity: 0.4; ', /*@cc_on 'filter:alpha(opacity=40);', @*/
        '    position: absolute; ',
        '    z-index: 999; ',
        '}',
        '.wnp_tooltip:hover {',
        '    opacity: 1; ', /*@cc_on 'filter:alpha(opacity=100);', @*/
        '}',
        '.wnp_tooltip a {',
        '    cursor: pointer;',
        '    display: block;',
        '    width: 54px;',
        '    height: 0;',
        '    line-height: 22px;',
        '    font-family: cursive;',
        '    font-size: 14px;',
        '    font-weight: bold;',
        '    text-align: center;',
        '    text-decoration: none;',
        '    color: #F0F0F0;',
        '    border-style: solid;',
        '    border-width: 15px 0;',  /*@cc_on 'border-width: 15px 0 16px;', @*/
        '    border-top-color: #555;',
        '    border-bottom-color: #000;',
        '    padding: 0;',
        '    float: left;',
        '    margin-right: 2px;',
        '}',
        '.wnp_tooltip * span {',
        '    box-sizing: border-box;', borderBox,
        '    border: 1px solid #DDD;',
        '    display: inline-block;',
        '    width: 50px;', /*@cc_on 'width: 48px;', @*/
        '    height: 24px;',
        '    position: relative;',
        '    top: -15px;',
        '    margin-top: 3px;',
        '}',
        '.wnp_tooltip a:hover {',
        '    border-top-color: #666;',
        '}',
        '.wnp_tooltip a:hover span {',
        '    color: #FFF;',
        '    border-color: #FFF;',
        '}',
        '.wnp_tooltip a span:active { padding: 1px 0 0 2px; }',
        ].join('\n');
    };

function BUILD_FUNC(T) {
    if (T == null) T = window;
    // -- utils --
    // browser
    var browser = {
        opera   : (navigator.appName.indexOf("Opera") >= 0),
        mozilla : (navigator.userAgent.indexOf("Gecko/") >= 0),
        webkit  : (navigator.userAgent.indexOf("AppleWebKit/") >= 0),
        ie      : /*@cc_on!@*/false
    };
    T.browser = browser;
    var ie = {};
    ie.cssStandard = (document.compatMode && document.compatMode == 'CSS1Compat');
    ie.clientWidth = (function() {
        return ie.cssStandard ? function(d) { return (d || document).documentElement.clientWidth }
                              : function(d) { return (d || document).body.clientWidth }
    })();
    ie.clientHeight = (function() {
        return ie.cssStandard ? function(d) { return (d || document).documentElement.clientHeight }
                              : function(d) { return (d || document).body.clientHeight }
    })();
    ie.window = function(element) {
        return element.parentWindow || element.ownerDocument.parentWindow || window;
    };
    T.ie = ie;
    // event.
    var $e = (function() {
        if ('addEventListener' in window) return function(element) { return element };
        function preventDefault()  { this.returnValue  = false; }
        function stopPropagation() { this.cancelBubble = true;  }
        function compat(e, el) {
            if (!('preventDefault'  in e)) e.preventDefault = preventDefault;
            if (!('stopPropagation' in e)) e.stopPropagation = stopPropagation;
            if (!('target'          in e)) e.target = e.srcElement;
            if (!('relatedTarget'   in e)) e.relatedTarget = (e.srcElement === e.toElement) ? e.fromElement : e.toElement;
            if (!('currentTarget'   in e)) e.currentTarget = el;
            var d = el.ownerDocument || el.document || el;
            if (!('pageX'           in e)) e.pageX = (d.body.scrollLeft||d.documentElement.scrollLeft) + e.clientX;
            if (!('pageY'           in e)) e.pageY = (d.body.scrollTop ||d.documentElement.scrollTop ) + e.clientY;
            if (!e.detail && e.wheelDelta) e.detail = -(e.wheelDelta/120)*4;
        }
        function indexOf(listeners, a, b, c) {
            for (var i = 0, len = listeners.length; i < len; i++) {
                var l = listeners[i];
                if (l.a === a && l.b === b && l.c === c) return i;
            }
            return -1;
        }
        if ('attachEvent' in window) {
            return function $e(element) {
                if ('addEventListener' in element) return element;
                return (function(el) {
                    var listeners = [];
                    el.addEventListener = function(a, b, c) {
                        if (indexOf(listeners, a, b, c) >= 0) return;
                        var f = function(e) { compat(e, el); b.call(el, e); };
                        el.attachEvent('on' + a, f);
                        listeners.push({ a: a, b: b, c: c, f: f});
                    };
                    el.removeEventListener = function(a, b, c) {
                        var index = indexOf(listeners, a, b, c);
                        if (index < 0) return;
                        el.detachEvent('on' + a, listeners[index].f);
                        listeners.splice(index, 1);
                    };
                    return el;
                })(element);
            }
        }
        else {
            return function(el) {
                if (el.addEventListener) return el;
                el.addEventListener = el.removeEventListener = function() {};
                throw 'Neither "addEventListener" nor "attachEvent" is supported on this browser.';
            }
        }
    })();
    T.$e = $e;
    function uescape(s) {
        return escape(s).replace(/%([0-9A-F]{2})/g, '\\u00$1').replace(/%u/g, '\\u');
    }
    T.uescape = uescape;
    function toJSON(o) {
        if (o == null) return 'null';
        var c = o.constructor;
        if (c === Boolean) return o.toString();
        if (c === Number ) return isNaN(o) ? '"NaN"' : !isFinite(o) ? '"Infinity"' : o.toString(10);
        if (c === String ) return '"' + uescape(o) + '"';
        if (c === Array  ) {
            var tmp = [];
            for (var i = 0; i < o.length; i++) {
                tmp[i] = toJSON(o[i]);
            }
            return '[' + tmp.join(',') + ']';
        }
        if (typeof o == 'object') {
            var tmp = [];
            for (var i in o) {
                if (Object.prototype.hasOwnProperty.call(o, i)) {
                    tmp.push('"' + uescape(i) + '":' + toJSON(o[i]));
                }
            }
            return '{' + tmp.join(',') + '}';
        }
        return '\"' + uescape(o.toString()) + '\"';
    };
    T.toJSON = toJSON;
    var escapeHTML = (function() {
        var dv;
        return function escapeHTML(str, d) {
            if (dv == null) {
                dv = (d||document).createElement('div');
                setTimeout(function() { dv = null; }, 0);
            }
            dv.textContent = /*@cc_on dv.innerText = @*/ str;
            return dv.innerHTML;
        };
    })();
    T.escapeHTML = escapeHTML;
    function formatNumber(d) {
        return d.toString().replace(/(\d{1,3})(?=(?:\d\d\d)+$)/g, "$1,"); //http://nanto.asablo.jp/blog/2007/12/07/2479257
    };
    T.formatNumber = formatNumber;
    function getAbsolutePosition(el) {
        var p = el.offsetParent, x = el.offsetLeft, y = el.offsetTop;
        while (p) {
            x += p.offsetLeft; y += p.offsetTop;
            if (!browser.webkit) {  x -= p.scrollLeft; y -= p.scrollTop; }
            p = p.offsetParent;
        }
        return { x : x, y : y }
    };
    T.getAbsolutePosition = getAbsolutePosition;
    function hasClass(el, className) {
        //http://d.hatena.ne.jp/higeorange/20090613/1244821192
        return new RegExp('(?:^|\\s)' + className + '(?:\\s|$)').test(el.className);
    }
    T.hasClass = hasClass;
    function appendClass(el, className) {
        if (!el) return;
        if (new RegExp('(?:^|\\s)' + className + '\\s*$').test(el.className)) return;
        removeClass(el, className);
        el.className += ' ' + className;
    }
    T.appendClass = appendClass;
    function removeClass(el, className) {
        if (!el) return;
        var orgClassName = el.className;
        var newClassName = orgClassName.replace(new RegExp('(?:^|\\s)' + className + '(?:\\s|$)', 'g'), '').replace(/\s+/g, ' ').replace(/^\s|\s$/, '');
        if (orgClassName != newClassName) {
            el.className = newClassName;
        }
    }
    T.removeClass = removeClass;
    function addStyle(styleStr, doc) {
        var document = doc || window.document;
        var style = document.createElement('style');
        style.type = 'text/css';
        style.style.display = 'none';
        if (/*@cc_on !@*/true) { style.textContent = styleStr; } else { style.styleSheet.cssText = styleStr; }
        document.body.appendChild(style);
        return style;
    }
    T.addStyle = addStyle;
    function getStyle(element, property, pseudo) {
        return (
            element.currentStyle
            ||
            element.ownerDocument.defaultView.getComputedStyle(element, pseudo || '')
        )[property];
    }
    T.getStyle = getStyle;
    function $XS(xpath, context) {
        return document.evaluate(xpath,context||document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
    }
    T.$XS = $XS;
    function findVideoTitle(a) {
        var title = '';
        if (!/<script/i.test(a.innerHTML)) {
            var title = (a.textContent/*@cc_on || a.innerText || '' @*/).replace(/^\s+|\s+$/g, '');
            if (!title) {
                var img = a.getElementsByTagName('img')[0];
                if (img) title = (img.alt || '').replace(/^\s+|\s+$/g, '');
            }
        }
        if (!title) {
            var videoid = a.href.replace(/.*?watch\/(\w+).*/, '$1');
            if (document.evaluate) {
                var aa = $XS('/\/a[contains(@href,"watch/' + videoid + '") and not(descendant::img)]', a.ownerDocument);
                if (aa) title = (aa.textContent/*@cc_on || aa.innerText || '' @*/).replace(/^\s+|\s+$/g, '');
            }
            else {
                var an = a.ownerDocument.getElementsByTagName('a');
                var findHref = 'watch/' + videoid;
                for (var i = 0, len = an.length; i < len; i++) {
                    var aa = an[i];
                    if (aa.href.indexOf(findHref) >= 0 && !/<script|<img/i.test(aa.innerHTML)) {
                        title =  (aa.textContent/*@cc_on || aa.innerText || '' @*/).replace(/^\s+|\s+$/g, '');
                        if (title) break;
                    }
                }
            }
        }
        return title;
    }
    T.findVideoTitle = findVideoTitle;
    function createPlayInfo(el) {
        var an = el.getElementsByTagName('a');
        if (an.length == 0 && el.nodeName == 'A') {
            an = [el];
        }
        var items = [],
            video = {},
            title = {},
            image = {};
        for (var i = 0; i < an.length; i++) {
            var a = an[i];
            if (a != el && /\bnofollow\b/.test(a.getAttribute('rel'))) continue;
            var m;
            if (m = /(http:\/\/www\.nicovideo\.jp\/watch\/(\w+))/.exec(a.href)) {
                var videoid = m[2];
                if (!video[videoid]) {
                    items.push(videoid);
                    video[videoid] = m[1];
                }
                if (/<script/i.test(a.innerHTML)) continue;
                var img = a.getElementsByTagName('img')[0];
                if (img) {
                    title[videoid] = title[videoid] || img.alt;
                    image[videoid] = image[videoid] || img.src;
                }
                if (!title[videoid]) {
                    title[videoid] = a.textContent/*@cc_on || a.innerText || '' @*/;
                }
            }
        }
        return { items: items, video: video, title: title, image: image }
    }
    T.createPlayInfo = createPlayInfo;
    function createVideoInfo(playInfo, index) {
        var videoid = playInfo.items[index || 0];
        return {
            id        : videoid,
            url       : playInfo.video[videoid],
            title     : playInfo.title[videoid],
            thumbnail : playInfo.image[videoid]
        }
    }
    T.createVideoInfo = createVideoInfo;
    function createPlayInfoFromUrl(url, callback) {
        var loader = document.createElement('iframe');
        loader.src = url;
        loader.style.display = 'none';
        $e(loader).addEventListener('load', function() {
            var playlist = createPlayInfo(loader.contentWindow.document.documentElement);
            loader.parentNode.removeChild(loader);
            callback(playlist);
        }, false);
        document.body.appendChild(loader);
    }
    T.createPlayInfoFromUrl = createPlayInfoFromUrl;
    var makeNicoLinks = (function() {
        var makeNicoReg = /(https?:\/\/[-_.!~*()a-zA-Z0-9;\/?:@&=+$,%#]+)|([a-z]{2}\d+)|(mylist\/\d+)|(^|\D)(\d{10})(?!\d)/mg;
        return function makeNicoLinks(str) {
            return str.replace(makeNicoReg, function(str, $1, $2, $3, $4, $5){
                if ($1 != null) return ' <a href="' + $1 + '" target="_blank" rel="nofollow">' + $1 + '</a> ';
                if ($2 != null) {
                    if ($2 == 'mp3') return $2;
                    var co = $2.substring(0, 2) == 'co';
                    if (co) return ' <a href="http://com.nicovideo.jp/community/' + $2 + '" target="_blank" rel="nofollow">'+ $2 + '</a> ';
                    else    return ' <a href="http://www.nicovideo.jp/watch/' + $2 + '" target="_blank" rel="nofollow">'+ $2 + '</a> ';
                }
                if ($3 != null) return ' <a href="http://www.nicovideo.jp/' + $3 + '" target="_blank" rel="nofollow">'+ $3 + '</a> ';
                if ($5 != null) return $4 + ' <a href="http://www.nicovideo.jp/watch/' + $5 + '" target="_blank" rel="nofollow">'+ $5 + '</a> ';
            });
        };
    })();
    T.makeNicoLinks = makeNicoLinks;
    function extend(d, s) {
        for (var p in s) d[p] = s[p];
        return d;
    }
    T.extend = extend;
    function postError(e) {
        if (window.opera) opera.postError(e);
        else if (window.console) {
            if (e.name != null && e.message != null) {
                console.error('[Error:\nname: ' + e.name + '\nmessage: ' + e.message + '\n]');
            }
            else {
                console.error(e);
            }
        }
    }
    T.postError = postError;
    /**
     * EventDispatcher
     * @see http://www.fladdict.net/blog-jp/archives/2005/06/javascript.php
     * @see http://www.adobe.com/support/documentation/jp/flex/1/mixin/mixin3.html
     */
    var EventDispatcher = function() {};
    (function() {
        var ec = '__ed_eventContainer';
        EventDispatcher.prototype.addEventListener = function(type, listener) {
            if (this[ec]       == null) this[ec]       = new Object(); 
            if (this[ec][type] == null) this[ec][type] = new Array(); 
            this.removeEventListener(type, listener);
            this[ec][type].push(listener);
        };
        EventDispatcher.prototype.removeEventListener = function(type, listener) {
            if (this[ec] == null || this[ec][type] == null) return;
            var listeners = this[ec][type];
            for (var i = listeners.length - 1; i >= 0; i--) {
                if ((listeners[i] === listener) ? listeners.splice(i, 1) : false) break;
            }
        };
        EventDispatcher.prototype.dispatchEvent = function(event) {
            if (this[ec] == null || this[ec][event.type] == null) return;
            if (event.target == null) event.target = this;
            var listeners = this[ec][event.type];
            for (var i = 0, len = listeners.length; i < len; i++) {
                try {
                    var l = listeners[i];
                    if (typeof(l) == 'function') l.call(this, event);
                    else new Function(l).call(this, event);
                }
                catch(e) {
                    postError(e);
                }
            }
        };
    })()
    EventDispatcher.initialize = function(obj) {
        extend(obj, EventDispatcher.prototype);
    };
    T.EventDispatcher = EventDispatcher;
    /**
     * class ListElementIterator
     */
    function ListElementIterator(listElement) {
        this.initialize.apply(this, arguments);
    }
    ListElementIterator.prototype = {
        initialize : function(listElement) {
            this.listElement = listElement;
            this.item = null;
        },
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
    T.ListElementIterator = ListElementIterator;
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
     *   finish           - finish soaring.
     * ------------------- *
     * -- examples ------- *
     * 1.
     *   var soar = new Soar(div);
     *   soar.to({scrollTop: 100});
     *   soar.go();
     * 2.
     *   new Soar(div.style).from({width:'100px'}).to({width:'200px'}).go();
     *   new Soar(div.style).from({marginLeft:'0'}).to({marginLeft:'-100.0%'}).go();
     */
    function Soar(object, option) {
        this.object = object;
        var o = option || {};
        this.duration = o.duration || 500;
        this.delay = o.delay || 10;
        this.coe = (o.coe != null) ? o.coe : 0.15;
    }
    EventDispatcher.initialize(Soar.prototype);
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
        this.window = win || (obj.ownerDocument ? (obj.ownerDocument.defaultView/*@cc_on || ie.window(obj) @*/) : null) || window;
        for (var p in this._from) {
            obj[p] = this._from[p];
        }
        var target = [];
        for (var p in this._to) {
            var start = parseFloat(obj[p]);
            var m = /(-?[0-9]+\.?([0-9]*))(.*)/.exec(this._to[p]);
            var dest  = parseFloat(m[1]);
            var scale = m[2].length;
            var unit  = m[3] || /[^0-9]*$/.exec(obj[p]);
            target.push({ prop: p, cur: start, dest: dest, scale: scale, unit: unit });
        }
        var n = Math.ceil(this.duration / this.delay);
        var self = this;
        var startTime = new Date().getTime();
        self.tid = this.window.setTimeout(function() {
            var now = new Date().getTime();
            var nn = (self.duration - (now - startTime)) / self.delay;
            while (n > nn && n > 0) {
                for (var i = 0, len = target.length; i < len; i++) {
                    var t = target[i];
                    t.cur = t.cur + (t.dest - t.cur) * (1/n + (1-1/n) * self.coe);
                }
                n--;
            }
            var finishCount = 0;
            for (var i = 0, len  = target.length; i < len; i++) {
                var t = target[i];
                var next = t.cur.toFixed(t.scale);
                obj[t.prop] = next + t.unit;
                if (next == t.dest) finishCount++;
            }
            if (finishCount != target.length && n > 0) {
                self.tid = self.window.setTimeout(arguments.callee, self.delay);
            }
            else {
                self.isActive = false;
                self.dispatchEvent({ type: 'finish' });
            }
        }, 0);
        this.isActive = true;
    }
    Soar.prototype.cancel = function() {
        if (this.isActive) {
            this.window.clearTimeout(this.tid);
            this.isActive = false;
        }
        this._from = null;
        return this;
    }
    T.Soar = Soar;
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
     *   select           - fire event when select item.
     *   itemover         - fire event when mouseover item(except dragging).
     *   itemout          - fire event when mouseout item(except dragging).
     *   dragstart        - fire event when drag start.
     *   dragging         - fire event when dragging.
     *   dragover         - fire event when drag over other draggable element.
     *   dragend          - fire event when drag end.
     *   dragcancel       - fire event when drag cancel.
     * ------------------- *
     */
    function ListUtil() {
        this.initialize.apply(this, arguments);
    }
    EventDispatcher.initialize(ListUtil.prototype);
    ListUtil.prototype.initialize = function(listElement) {
        this.listElement = listElement;
        this.selectedItems = [];
        this.initEvents();
        this.hoverColor = '#D7EBFF';
        this.selectedColor = '#B4DAFF';
        this.draggingColor = '#FFCCCC';
    };
    ListUtil.prototype.select = function(element) {
        var items = this.selectedItems;
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            item.style.backgroundColor = '';
            if (item === this.hoverItem) {
                item.style.backgroundColor = this.hoverColor;
            }
        }
        if (!element) return;
        this.selectedItems = [element];
        var items = this.selectedItems;
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            item.style.backgroundColor = this.selectedColor;
        }
        this.dispatchEvent({ type: 'select' });
    };
    ListUtil.prototype.itemOver = function(element) {
        var items = this.selectedItems;
        var selected = false;
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if (item === element) {
                selected = true;
                break;
            }
        }
        if (!selected) element.style.backgroundColor = this.hoverColor;
        this.dispatchEvent({ type: 'itemover', item: element });
    };
    ListUtil.prototype.itemOut = function(element) {
        var items = this.selectedItems;
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if (item === element) return;
        }
        element.style.backgroundColor = '';
        this.dispatchEvent({ type: 'itemout', item: element });
    };
    ListUtil.prototype.dragStart = function(element) {
        if (this.target) {
            this.target.style.backgroundColor = '';
        }
        if (this.dropTargetItem) {
            this.dropTargetItem.style.background = '';
        }
        this.target = element;
        this.target.style.backgroundColor = this.draggingColor;
        this.targetImage = this.target.querySelector('img.thumbnail').src;
        this.listElement.style.cursor = 'move';
        /*@cc_on
        this.target.querySelector('.wnp_iecover').style.cursor = 'move';
        @*/
        this.dispatchEvent({ type: 'dragstart' });
    };
    ListUtil.prototype.dragging = function() {
        this.dispatchEvent({ type: 'dragging' });
    };
    ListUtil.prototype.dragOver = function(element) {
        if (this.dropTargetItem && this.dropTargetItem !== this.target) {
            this.dropTargetItem.style.background = '';
        }
        this.dropTargetItem = element;
        if (this.dropTargetItem !== this.target) {
            this.dropTargetItem.style.background = 'url("' + this.targetImage + '") no-repeat center top';
        }
        this.dispatchEvent({ type: 'dragover', item: element });
    };
    ListUtil.prototype.dragEnd = function() {
        this.target.style.backgroundColor = this.selectedColor;
        if (this.dropTargetItem) {
            if (this.dropTargetItem !== this.target) {
                this.dropTargetItem.style.background = '';
                for (var p = this.dropTargetItem; p && p !== this.target; p = p.previousSibling);
                this.dropTargetItem.parentNode.insertBefore(this.target,  (p) ? this.dropTargetItem.nextSibling : this.dropTargetItem);
            }
            this.dropTargetItem = null;
        }
        this.target = null;
        this.listElement.style.cursor = '';
        /*@cc_on
        this.target.querySelector('.wnp_iecover').style.cursor = '';
        @*/
        this.dispatchEvent({ type: 'dragend', item: element });
    };
    ListUtil.prototype.dragCancel = function() {
        if (this.dropTargetItem) {
            this.dropTargetItem.style.background = '';
        }
        this.target.style.backgroundColor = this.selectedColor;
        this.target = null;
        this.listElement.style.cursor = '';
        this.dispatchEvent({ type: 'dragcancel' });
    };
    ListUtil.prototype.createProxy = function(el) {
        var proxy = el.cloneNode(true);
        proxy.removeAttribute('id');
        var an = proxy.getElementsByTagName('a');
        for (var i = 0, len = an.length; i < len; i++) {
            an[i].removeAttribute('href');
        }
        return proxy;
    };
    ListUtil.prototype.cancel = function() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.scrollingCancel();
        this.dragCancel();
    };
    ListUtil.prototype.initEvents = function() {
        var document = this.listElement.ownerDocument;
        var window = document.defaultView/*@cc_on || ie.window(document) @*/;
        var self = this;
        var scrollTid = null;
        var direction = null;
        var range = 60;
        this.scrollingCancel = function() {
            if (scrollTid) {
                window.clearInterval(scrollTid);
                scrollTid = direction = null;
            }
        };
        $e(document).addEventListener('keydown', this.event_keydown = function(e) {
            if (e.keyCode === 27) {
                self.cancel();
            }
        }, false);
        $e(document).addEventListener('mouseup', this.event_document_mouseup = function(e) {
            self.scrollingCancel();
            if (self.isDragging) {
                self.isDragging = false;
                var pos = getAbsolutePosition(self.listElement);
                pos.x += self.listElement.clientLeft;
                pos.y += self.listElement.clientTop;
                if (e.clientX >= pos.x && e.clientX <= (pos.x + self.listElement.clientWidth) && e.clientY >= pos.y && e.clientY <= (pos.y + self.listElement.clientHeight)) {
                    self.dragEnd();
                }
                else {
                    self.dragCancel();
                }
            }
        }, false);
        $e(document).addEventListener('mousemove', this.event_document_mousemove = function(e) {
            if (self.isDragging) {
                e.preventDefault();
                if (e.clientY < (self.listElement.offsetTop + 25)) {
                    // scroll up
                    var sub = (self.listElement.offsetTop + 25) - e.clientY;
                    range = 50 * (Math.ceil(sub/20));
                    if (scrollTid && direction != 1) {
                        window.clearInterval(scrollTid);
                    }
                    if (direction != 1) {
                        direction = 1;
                        scrollTid = window.setInterval(function() {
                            self.listElement.scrollTop -= range;
                        }, 100);
                    }
                }
                else if (e.clientY > (self.listElement.offsetTop + self.listElement.offsetHeight - 25)) {
                    // scroll down
                    var sub = e.clientY - (self.listElement.offsetTop + self.listElement.offsetHeight - 25);
                    range = 50 * (Math.ceil(sub/20));
                    if (scrollTid && direction != 2) {
                        window.clearInterval(scrollTid);
                    }
                    if (direction != 2) {
                        direction = 2;
                        scrollTid = window.setInterval(function() {
                            self.listElement.scrollTop += range;
                        }, 100);
                    }
                }
                else {
                    self.scrollingCancel();
                }
                self.dragging();
            }
        }, false);
        $e(this.listElement).addEventListener('mousedown', this.event_element_mousedown = function(e) {
            if (e.target === e.currentTarget) return;
            var item = e.target;
            while (item.parentNode !== e.currentTarget) item = item.parentNode;
            e.preventDefault();
            self.select(item);
            self.isDragging = true;
            self.dragStart(item);
        }, false);
        $e(this.listElement).addEventListener('mouseover', this.event_element_mouseover = function(e) {
            if (!self.isDragging) {
                // disable mousedown event on an inline element. (and enable link drag on Opera)
                if (e.target === e.currentTarget || /^(a|span|img|input|button|object|embed|iframe)$/i.test(e.target.nodeName)) {
                    $e(self.listElement).removeEventListener('mousedown', self.event_element_mousedown, false);
                }
                else {
                    $e(self.listElement).addEventListener('mousedown', self.event_element_mousedown, false);
                }
                /*@cc_on
                if (hasClass(e.target, 'wnp_iecover')) {
                    $e(self.listElement).addEventListener('mousedown', self.event_element_mousedown, false);
                }
                @*/
            }
            /*@cc_on
            if (self.isDragging) {
                e.preventDefault();
            }
            @*/
            if (e.target !== e.currentTarget) {
                var item = e.target;
                while (item && item.parentNode !== e.currentTarget) item = item.parentNode;
                if (!item) return;
                if (item !== self.hoverItem) {
                    self.hoverItem = item;
                    if (self.isDragging) {
                        self.dragOver(item);
                    }
                    else {
                        self.itemOver(item);
                    }
                }
            }
        }, false);
        $e(this.listElement).addEventListener('mouseout', this.event_element_mouseout = function(e) {
            if (self.hoverItem) {
                var currentItem = self.hoverItem;
                var item = e.relatedTarget;
                while (item && item !== self.hoverItem) item = item.parentNode;
                if (item !== self.hoverItem) {
                    self.hoverItem = null;
                    if (!self.isDragging) {
                        self.itemOut(currentItem);
                    }
                }
            }
        }, false);
    };
    T.ListUtil = ListUtil;
    /**
     * class TimerManager.
     */
    function TimerManager(win) {
        this.win = win || window;
        this.timeouts = {};
        this.intervals = {};
    }
    TimerManager.prototype.setTimeout = function(name, func, delay) {
        this.clear(name);
        var self = this;
        this.timeouts[name] = this.win.setTimeout(function() {
            delete self.timeouts[name];
            func();
        }, delay);
    };
    TimerManager.prototype.setInterval = function(name, func, delay) {
        this.clear(name);
        this.intervals[name] = this.win.setInterval(func, delay);
    };
    TimerManager.prototype.clear = function(name) {
        if (this.timeouts[name]) {
            this.win.clearTimeout(this.timeouts[name]);
            delete this.timeouts[name];
        }
        if (this.intervals[name]) {
            this.win.clearInterval(this.intervals[name]);
            delete this.intervals[name];
        }
    };
    T.TimerManager = TimerManager;
    var Cookie = {
        get : function(key) {
            return decodeURIComponent((new RegExp('(?: |^)' + key + '=([^;]*)').exec(document.cookie) || / _ / )[1]);
        },
        set : function(key, value, expires, path, domain) {
            document.cookie = key + '=' + encodeURIComponent(value) + 
                (expires ? ('; expires=' + new Date(expires).toGMTString()) : '') +
                (path    ? ('; path=' + path) : '') +
                (domain  ? ('; domain=' + domain) : '');
        },
        del : function(key) {
            document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    };
    T.Cookie = Cookie;
    /**
     * class ListedKeyMap.
     * Map implementation that has listed keys.
     */
    function ListedKeyMap() {
        this._keys = [];
        this._values = {};
    }
    ListedKeyMap.prototype = {
        has : function(key) {
            return this._values.hasOwnProperty(key);
        },
        get : function(key) {
            return this._values[key];
        },
        getAt : function(index) {
            return this._values[this._keys[index]];
        },
        add : function(key, value) {
            if (this.has(key)) this.remove(key);
            this._values[key] = value;
            this._keys.push(key);
        },
        insertAt : function(index, key, value) {
            if (this.has(key)) return;
            this._values[key] = value;
            this._keys.splice(index, 0, key);
        },
        remove : function(key) {
            if (this.has(key)) {
                this._keys.splice(this.indexOf(key), 1);
                delete this._values[key];
            }
        },
        removeAt : function(index) {
            var key = this._keys[index];
            this._keys.splice(index, 1);
            delete this._values[key];
        },
        indexOf : (function() {
            if (Array.prototype.indexOf) {
                return function(key) { return this._keys.indexOf(key); }
            }
            else {
                return function(key) { 
                    var keys = this._keys;
                    for (var i = 0, len = keys.length; i < len; i++) {
                        if (keys[i] === key) return i;
                    }
                    return -1;
                }
            }
        })(),
        keys : function() {
            return this._keys.concat();
        },
        count : function() {
            return this._keys.length;
        }
    };
    T.ListedKeyMap = ListedKeyMap;
}
WNP.BUILD_FUNC = BUILD_FUNC;
function BUILD_WNP(T) {
    if (!T) T = window;
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
     *   load             - fire event when the video page loaded.
     *   start            - fire event when the video started.
     *   error            - fire event when could't load video. (deleted or other)
     *   finish           - fire event when finished playing video.
     * ------------------- *
     */
    function WNPCore() {
        this.initialize.apply(this, arguments);
    };
    WNPCore.STYLE_FILL      = 'fill';
    WNPCore.STYLE_RESTORE   = 'restore';
    WNPCore.STYLE_ALTERNATE = 'alternate';
    WNPCore.emptyFunc = new Function();
    EventDispatcher.initialize(WNPCore.prototype);
    WNPCore.prototype.initialize = function(document, name) {
        this.element = this.build(document || window.document, name);
        this.videoinfo = null;
        this.isPlaying = false;
        this.style = WNPCore.STYLE_FILL;
        this.isControlShowing = false;
        this.autoRelayout = true;
        this.emptyView();
        this.timer = new TimerManager(this.element.ownerDocument.defaultView || ie.window(this.element));
    }
    WNPCore.prototype.build = function(document, name) {
        var dv = document.createElement('div');
        var borderBox = browser.mozilla ? '-moz-box-sizing : border-box;' : browser.webkit ? '-webkit-box-sizing : border-box;' : '';
        dv.style.cssText = [
            'box-sizing: border-box;', borderBox,
            'width: 100%; height: 100%;',
            'color: white;',
            'background-color: #4F586D;',
            'margin: 0; padding: 0;',
            'border-style: solid;',
            'border-color: #050608 black;',
            'border-width: 0;',
            'overflow: hidden;',
            'position: relative;'
        ].join('');
        dv.innerHTML = [
            '<div style="position: absolute; margin: 0; padding: 0; border: none; width: 100%; height: 100%; display: none; border-style: solid; box-sizing: border-box; ', borderBox, 'border-color: #050608 black;">',
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
        return this._container;
    };
    WNPCore.prototype.show = function() {
        this.isHiding = false;
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.layout();
    };
    WNPCore.prototype.hide = function() {
        this.isHiding = true;
        this.element.style.width = '0';
        this.element.style.height = '0';
        this.element.style.borderWidth = '0';
        this._loadingbx.style.display = 'none';
    };
    WNPCore.prototype.detach = function() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    };
    WNPCore.prototype.nico = function() {
        var nicoWindow   = this._nicoframe.contentWindow;
        var nicoDocument = (nicoWindow) ? nicoWindow.document : null;
        var flvplayer    = (nicoDocument) ? nicoDocument.getElementById('flvplayer') : null;
        return {
            window : nicoWindow,
            document : nicoDocument,
            flvplayer : flvplayer
        }
    };
    WNPCore.prototype.loadingStart = function() {
        this.isLoading = true;
        this._caption.innerHTML = 'now loading.';
        this._caption.style.display = '';
    };
    WNPCore.prototype.loadingEnd = function() {
        this.isLoading = false;
        this._caption.style.display = 'none';
    };
    WNPCore.prototype.setAlternativeView = function(element, width, height) {
        if (element == null) {
            this.alternativeElement = null;
            this.alternativeElementSize = null;
            return;
        }
        this.alternativeElement = element;
        this.alternativeElementSize = { width: width, height: height };
        if (this.style == WNPCore.STYLE_ALTERNATE) {
            this.alternativeView();
        }
    };
    WNPCore.prototype.play = function(videoinfo) {
        // resume if 0 arguments.
        if (!videoinfo && this.isPlaying) {
            this.resume();
            return;
        }
        this._container.style.backgroundColor = 'black';
        this.videoinfo = videoinfo;
        var video_url = videoinfo.url || videoinfo.id || videoinfo;
        if (!/^http:/.test(video_url)) video_url = 'http://www.nicovideo.jp/watch/' + video_url;
        if (this._nicoframe.parentNode === this._container) {
            this._container.removeChild(this._nicoframe);
        }
        this._nicoframe.src = video_url;
        this.isPlaying = true;
        this.loadingStart();
        this.layout();
        this._container.appendChild(this._nicoframe);
        this.currentLocation = this._nicoframe.src;
        this.observeLoad();
    };
    WNPCore.prototype.stop = function() {
        this.isPlaying = false;
        this.isPausing = false;
        this.timer.clear('observe');
        this.emptyView();
        this.videoinfo = null;
        this.currentLocation = null;
        this.alternativeElement = null;
    };
    WNPCore.prototype.pause = function() {
        this.isPausing = true;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return;
        try {
            if (flvplayer.ext_getStatus() == 'playing') {
                flvplayer.ext_play(0);
            }
        }
        catch(e) { postError(e) }
    },
    WNPCore.prototype.resume = function() {
        this.isPausing = false;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return;
        try {
            if (flvplayer.ext_getStatus() != 'playing') {
                flvplayer.ext_play(1);
            }
        }
        catch(e) { postError(e) }
    };
    WNPCore.prototype.layout = function() {
        if (this.isHiding) return;
        if (!this.isPlaying) {
            this.emptyView();
            return;
        }
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
    };
    WNPCore.prototype.sight = function() {
        try {
            var nico = this.nico();
            var p = getAbsolutePosition(nico.flvplayer);
            if (this.currentSize.viewW && this.currentSize.viewW < Consts.ORG_PLAYER_MINIMUM_WIDTH) {
                p.x += (Consts.ORG_PLAYER_MINIMUM_WIDTH - this.currentSize.viewW) / 2;
            }
            nico.window.scrollTo(p.x, p.y);
        }
        catch(e) { postError(e) }
    };
    WNPCore.prototype.emptyView = function() {
        this._container.style.borderWidth = '0';
        this._container.style.backgroundColor = '#4F586D';
        this._loadingbx.style.display = 'none';
        if (this._nicoframe.parentNode == this._container) {
            this._container.removeChild(this._nicoframe);
        }
    };
    WNPCore.prototype.fillView = function() {
        if (!this.isPlaying) return;
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
            var viewW = w; // wmp frame
            var viewH = Math.floor(viewW * Consts.ORG_PLAYER_VIEW_HEIGHT / Consts.ORG_PLAYER_VIEW_WIDTH);
            if (viewH > h) {
                viewH = h;
                viewW = Math.floor(viewH * Consts.ORG_PLAYER_VIEW_WIDTH / Consts.ORG_PLAYER_VIEW_HEIGHT);
            }
            var playerW = Math.max(viewW, Consts.ORG_PLAYER_MINIMUM_WIDTH);
            var playerH = viewH + Consts.ORG_PLAYER_CONTROL_HEIGHT;
            this.currentSize = { viewW: viewW, viewH: viewH, playerW: playerW, playerH: playerH };
            // set container's border.
            this._container.style.borderWidth = 
                Math.ceil((h - viewH) / 2) + 'px ' + 
                Math.floor((w - viewW) / 2) + 'px ' + 
                Math.floor((h - viewH) / 2) + 'px ' + 
                Math.ceil((w - viewW) / 2) + 'px';
            // player resize.
            if (!this._nicoframe.contentWindow || !this._nicoframe.contentWindow.document) return;
            var nico = this.nico();
            if (!browser.mozilla) {
                nico.document.documentElement.style.overflow = 'hidden';
            }
            if (!nico.flvplayer) return;
            var flvplayer = nico.flvplayer;
            // set player width, height.
            if (nico.window.maximizePlayer !== WNPCore.emptyFunc) {
                this._org_maximizePlayer = nico.window.maximizePlayer;
                nico.window.maximizePlayer = WNPCore.emptyFunc;
            }
            if (!this._wnp_restorePlayer) {
                var self = this;
                this._wnp_restorePlayer = function() {
                    try {
                        java.lang.Thread.sleep(1000); /// prevent auto restorePlayer when then video finished.
                    }
                    catch(e) { postError(e) }
                    try {
                        self._org_restorePlayer();
                    }
                    catch(e) { postError(e) }
                }
            }
            if (nico.window.restorePlayer !== this._wnp_restorePlayer) {
                this._org_restorePlayer = nico.window.restorePlayer;
                nico.window.restorePlayer = this._wnp_restorePlayer;
            }
            flvplayer.ext_setVideoSize('fit');
            flvplayer.style.width = flvplayer.parentNode.style.width = playerW + 'px';    // for scroll.
            flvplayer.style.height = flvplayer.parentNode.style.height = playerH + 'px';
            
            // scroll to player top-left.
            this._nicoframe.style.display = '';
            this.sight();
            this._nicoframe.style.visibility = 'visible';
        }
        catch (e) {
            postError(e);
            this._nicoframe.style.display = '';
            this._nicoframe.style.visibility = 'visible';
        }
    };
    WNPCore.prototype.restoreView = function() {
        if (!this.isPlaying) return;
        this.style = WNPCore.STYLE_RESTORE;
        this.isControlShowing = false;
        this._nicoframe.style.display = 'none'; // for performance.
        this._nicoframe.style.width = '100%';
        this._nicoframe.style.height = '100%';
        this._container.style.borderWidth = '0';
        this._loadingbx.style.display = 'none';
        try {
            var nico = this.nico();
            if (!browser.mozilla) {
                nico.document.documentElement.style.overflow = (this.isPlaying) ? 'scroll' : 'hidden';
            }
            if (this._org_maximizePlayer && nico.window.maximizePlayer === WNPCore.emptyFunc) {
                nico.window.maximizePlayer = this._org_maximizePlayer;
                delete this._org_maximizePlayer;
            }
            if (this._org_restorePlayer && nico.window.restorePlayer === this._wnp_restorePlayer) {
                nico.window.restorePlayer = this._org_restorePlayer;
                delete this._org_restorePlayer;
            }
            var flvplayer = nico.flvplayer
            flvplayer.style.width = flvplayer.parentNode.style.width = '';
            flvplayer.style.height = flvplayer.parentNode.style.height = '';
            if (browser.mozilla) {
                // avoid error on firefox3.5
                nico.window.location.href = 'javascript:void($("flvplayer").ext_setVideoSize("normal"))';
            }
            else {
                flvplayer.ext_setVideoSize('normal');
            }
        }
        catch(e) { postError(e) }
        this._nicoframe.style.display = '';
    };
    WNPCore.prototype.alternativeView = function() {
        if (!this.isPlaying) return;
        this.style = WNPCore.STYLE_ALTERNATE;
        this._nicoframe.style.width = '1px';  // minimum viewing.
        this._nicoframe.style.height = '1px';
        this._container.style.borderWidth = '0';
        this._loadingbx.style.display = 'none';
        // set alternative element.
        var alterElement = this.alternativeElement;
        var alterSize = this.alternativeElementSize || {};
        if (!alterElement) {
            alterElement = this._container.ownerDocument.createElement('img');
            if (this.videoinfo && this.videoinfo.thumbnail) {
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
    };
    WNPCore.prototype.setControlShowing = function(show) {
        if (!this.isPlaying || this.style != WNPCore.STYLE_FILL) return;
        if (this.isControlShowing === !!show) return;
        this.isControlShowing = !!show;
        var controlHeight = Consts.ORG_PLAYER_CONTROL_HEIGHT;
        this.nico().window.scrollBy(0, controlHeight * (show ? 1 : -1));
    },
    WNPCore.prototype.setCommentOff = function(off) {
        this.isCommentOff = !!off;
        if (!this.isPlaying) return;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return;
        try {
            flvplayer.ext_setCommentVisible(!this.isCommentOff);
        }
        catch(e) { postError(e) }
    };
    WNPCore.prototype.setRepeat = function(repeat) {
        this.isRepeat = !!repeat;
        if (!this.isPlaying) return;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return;
        try {
            flvplayer.ext_setRepeat(this.isRepeat);
        }
        catch(e) { postError(e) }
    };
    WNPCore.prototype.setMute = function(mute) {
        this.isMute = !!mute;
        if (!this.isPlaying) return;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return;
        try {
            flvplayer.ext_setMute(this.isMute);
        }
        catch(e) { postError(e) }
    };
    WNPCore.prototype.seek = function(time) {
        if (!this.isPlaying) return;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return;
        try {
            var len = Number(flvplayer.ext_getTotalTime());
            var cur = Number(flvplayer.ext_getPlayheadTime());
            if (this.nextSeekTo != null) {
                if (time > 0 && cur < this.nextSeekTo) cur = this.nextSeekTo;
                if (time < 0 && cur > this.nextSeekTo) cur = this.nextSeekTo;
            }
            var to = cur + Number(time) - 2.5; // fine adjustment.
            if (isNaN(to)) return;
            if (to > len) to = len;
            if (to < 0  ) to = 0;
            this.nextSeekTo = to;
            flvplayer.ext_setPlayheadTime(to);
            flvplayer.ext_setVolume(Number(flvplayer.ext_getVolume())-1e-14); // for silence after ext_setPlayheadTime. (2009/08/07)
            var self = this;
            this.timer.setTimeout('seek', function() {
                self.nextSeekTo = null;
                self.seekTid = null;
                // for shotage of backward seek.
                var cur = Number(flvplayer.ext_getPlayheadTime());
                if (time < 0 && cur - to > 7) {
                    flvplayer.ext_setPlayheadTime(Math.max(to - 10, 0));
                    flvplayer.ext_setVolume(Number(flvplayer.ext_getVolume())+1e-14);
                }
                // for shotage of forward seek (for seekDisabled).
                if (time > 0 && to - cur > 7) {
                    flvplayer.ext_setPlayheadTime(Math.min(to + 10, len));
                    flvplayer.ext_setVolume(Number(flvplayer.ext_getVolume())+1e-14);
                }
            }, 100);
            return to;
        }
        catch(e) { postError(e) }
    };
    WNPCore.prototype.seekTo = function(sec) {
        if (!this.isPlaying) return;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return;
        try {
            var len = Number(flvplayer.ext_getTotalTime());
            var to = Number(sec);
            if (isNaN(to)) return;
            if (to > len) to = len;
            if (to <= 0) to = 0;
            flvplayer.ext_setPlayheadTime(to);
            flvplayer.ext_setVolume(Number(flvplayer.ext_getVolume())-1e-14);
            return to;
        }
        catch(e) { postError(e) }
    };
    WNPCore.prototype.current = function() {
        if (!this.isPlaying) return 0;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return 0;
        try {
            var cur = Number(flvplayer.ext_getPlayheadTime());
            return isNaN(cur) ? 0 : cur;
        }
        catch(e) { 
            postError(e);
            return 0;
        }
    };
    WNPCore.prototype.length = function() {
        if (!this.isPlaying) return -1;
        if (this.videoinfo.length != null) return this.videoinfo.length;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return -1;
        try {
            var length = Number(flvplayer.ext_getTotalTime());
            if (isNaN(length)) return 0;
            this.videoinfo.length = length;
            return length;
        }
        catch(e) { 
            postError(e);
            return -1;
        }
    };
    WNPCore.prototype.volume = function(vol) {
        if (!this.isPlaying) return 0;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return 0;
        try {
            var cur = Number(flvplayer.ext_getVolume());
            if (vol == null) return cur;
            var to = cur + Number(vol);
            if (to > 100) to = 100;
            if (to < 0  ) to = 0;
            flvplayer.ext_setVolume(to);
            return to;
        }
        catch(e) { 
            postError(e);
            return 0;
        }
    };
    WNPCore.prototype.volumeTo = function(vol) {
        if (!this.isPlaying) return 0;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return 0;
        try {
            var to = Number(vol);
            if (to > 100) to = 100;
            if (to < 0  ) to = 0;
            flvplayer.ext_setVolume(to);
            return to;
        }
        catch(e) { 
            postError(e);
            return 0;
        }
    };
    WNPCore.prototype.loaded = function() {
        if (!this.isPlaying) return 0;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return 0;
        try {
            var cur = Number(flvplayer.ext_getLoadedRatio());
            return isNaN(cur) ? 0 : cur;
        }
        catch(e) { 
            postError(e);
            return 0;
        }
    };
    WNPCore.prototype.commentNum = function() {
        if (!this.isPlaying) return 0;
        var flvplayer = this.nico().flvplayer;
        if (!flvplayer) return 0;
        var num = Number(flvplayer.GetVariable('last_resno'));
        return num;
    };
    WNPCore.prototype.layoutIfNecessary = function() {
        if (!this.autoRelayout) return;
        if (!this.containerSize) this.containerSize = {};
        var container = this._container;
        var containerSize = this._containerSize;
        if (containerSize.width != container.offsetWidth || containerSize.height != container.offsetHeight) {
            containerSize.width = container.offsetWidth;
            containerSize.height = container.offsetHeight;
            this.layout();
            this.dispatchEvent({ type: 'resize' });
        }
    };
    WNPCore.prototype.observeLoad = function() {
        var self = this;
        this._containerSize = { width: this._container.offsetWidth, height: this._container.offsetHeight };
        var retry = 50;
        this.timer.setInterval('observe', function() {
            try {
                var nico = self.nico();
                if (!nico.window)   return;
                if (!nico.document) return;
                if (nico.window.location.href == 'about:blank') return;
                // unexpected redirect.
                if (!/^http:\/\/www\.nicovideo\.jp\/watch\/.*/.test(nico.window.location.href)) {
                    self.stop();
                    var event = { type: 'error', message : 'unexpected redirect.' };
                    self.dispatchEvent(event);
                    if (typeof self.onerror == 'function') try { self.onerror(event); } catch(e) { postError(e) }
                    return;
                }
                if (nico.window.User && !nico.window.User.id) { // logout.
                    nico.window.alert('\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044');
                    var event = { type: 'error', message : 'unexpected redirect.' };
                    self.dispatchEvent(event);
                    if (typeof self.onerror == 'function') try { self.onerror(event); } catch(e) { postError(e) }
                    self.stop();
                    return;
                }
                if (self.errorWhenDeleted) {
                    // delete check 1.
                    if (nico.document.getElementById('deleted_message_default')) {
                        self.stop();
                        var event = { type: 'error', message : 'this video got deleted.' };
                        self.dispatchEvent(event);
                        if (typeof self.onerror == 'function') try { self.onerror(event); } catch(e) { postError(e) }
                        return;
                    }
                    // delete check 2.
                    if (nico.window.Video && nico.window.Video.isDeleted) {
                        self.stop();
                        var event = { type: 'error', message : 'this video got deleted.' };
                        self.dispatchEvent(event);
                        if (typeof self.onerror == 'function') try { self.onerror(event); } catch(e) { postError(e) }
                        return;
                    }
                }
                self.layoutIfNecessary();
                var flvplayer = nico.flvplayer;
                if (!flvplayer) return;
                try {
                    var status = flvplayer.ext_getStatus();
                    if (status == 'playing' || status == 'paused' || (status == 'stopped' && Number(flvplayer.ext_getLoadedRatio()) >= 0.1)) {
                        flvplayer.ext_setMute(1); // cut first noise.
                        flvplayer.ext_play(1);
                    }
                    else {
                        return;
                    }
                }
                catch(e) {
                    return;
                }
                // stop page observing and go to next state.
                self.timer.clear('observe');
                self.nicoFrameLoaded();
                var event = { type: 'load' };
                self.dispatchEvent(event);
                if (self.onload) try { self.onload(event); } catch(e) { postError(e) }
                self.observePlay();
            }
            catch (e) {
                postError(e);
                // on error(perhaps security error), quit observing.
                if (--retry == 0) {
                    self.stop();
                    throw e;
                }
            }
        }, 200);
    };
    WNPCore.prototype.observePlay = function() {
        var self = this;
        var videoStarted = false;
        var videoFinished = false;
        var prePos = 0;
        var retry = 10;
        this.timer.setInterval('observe', function() {
            try {
                var nico = self.nico();
                // reload if location changed.
                if (!nico.window) {
                    self.stop();
                    return;
                }
                // unexpected redirect.
                if (!/^http:\/\/www\.nicovideo\.jp\/watch\/.*/.test(nico.window.location.href)) {
                    self.stop();
                    var event = { type: 'error', message : 'unexpected redirect.' };
                    self.dispatchEvent(event);
                    if (typeof self.onerror == 'function') try { self.onerror(event); } catch(e) { postError(e) }
                    return;
                }
                if (self.currentLocation != nico.window.location.href) {
                    var oldLocation = self.currentLocation;
                    var newLocation = nico.window.location.href;
                    self.currentLocation = newLocation;
                    self.observeLoad();
                    self.dispatchEvent({ type: 'jump', from: oldLocation, to: newLocation });
                    return;
                }
                self.layoutIfNecessary();
                var flvplayer = nico.flvplayer;
                // start check.
                if (!videoStarted) {
                    if (!self.isPausing) {
                        if (flvplayer.ext_getStatus() != 'playing') {
                            flvplayer.ext_play(1);
                            return;
                        }
                        var move = Number(flvplayer.ext_getPlayheadTime());
                        if (isNaN(move) || move < 2) return;
                    }
                    videoStarted = true;
                    self.dispatchEvent({ type: 'start' });
                    if (self.onstart) try { self.onstart(self) } catch(e) { postError(e) }
                }
                if (self.style == WNPCore.STYLE_FILL && flvplayer.ext_getVideoSize() != 'fit') { // for nicowari
                    if (!self.timer.timeouts['relayout']) {
                        self.timer.setTimeout('relayout', function() {
                            self.layout();
                        }, 1000);
                    }
                }
                // finish check.
                if (flvplayer.ext_getStatus() == 'end') {
                    if (flvplayer.ext_isRepeat()) return;
                    if (!videoFinished) {
                        videoFinished = true;
                        self.dispatchEvent({ type: 'finish' });
                        if (self.onfinish) try { self.onfinish(self) } catch(e) { postError(e) }
                    }
                }
                else {
                    videoFinished = false;
                }
                // backward seek event.
                var curPos = Number(flvplayer.ext_getPlayheadTime()) || 0;
                if (curPos < prePos) {
                    self.dispatchEvent({ type: 'back' });
                    if (self.onback) try { self.onback(self) } catch(e) { postError(e) }
                }
                prePos = curPos;
            }
            catch (e) {
                postError(e);
                // on error(maybe security error), quit observing.
                if (--retry == 0) {
                    self.timer.clear('observe');
                    throw e;
                }
            }
        }, this.observeInterval || 500);
    },
    WNPCore.prototype.nicoFrameLoaded = function() {
        this.loadingEnd();
        try {
            var nico = this.nico();
            this.videoinfo = nico.window.Video;
            var flvplayer = nico.flvplayer;
            flvplayer.SetVariable('Overlay.onRelease', ''); // onPress 
            flvplayer.SetVariable('Overlay.hitArea', 0);
            this.setCommentOff(this.isCommentOff);
            this.setRepeat(this.isRepeat);
            this.setMute(this.isMute);
            if (this.isPausing) {
                this.pause();
            }
            // http://orera.g.hatena.ne.jp/miya2000/20090711/p0
            if (browser.opera && nico.window.Element.scrollTo && !/setTimeout/.test(nico.window.Element.scrollTo)) {
                var org_scrollTo = nico.window.Element.scrollTo;
                Element.scrollTo = function() { var args = arguments; setTimeout(function() { org_scrollTo.apply(this, args) }, 0.01); };
            }
        }
        catch(e) { postError(e) }
        this.layout();
    };
    T.WNPCore = WNPCore;
    /**
     * WMP
     *   main object.
     */
    function WNP(Prefs) {
        this.initialize.apply(this, arguments);
    };
    WNP.prototype.initialize = function(Prefs) {
        var pref = Prefs || {};
        this.wnpWindow = window;
        this.build();
        this.wnpElement = this.wnpWindow.document.getElementById('WNP_PLAYER');
        var playlistElement = this.wnpWindow.document.getElementById('WNP_PLAYLIST_ITEMS');
        this.playlistIterator = new ListElementIterator(playlistElement);
        this.selectionIterator = new ListElementIterator(playlistElement);
        this.menuWidthRatio = Number(pref.MENU_WIDTH_RATIO) || 50;
        this.setLoop(!!pref.LOOP_ON_STARTUP);
        this.setCommentOff(!!pref.COMMENT_OFF_ON_STARTUP);
        this.setMute(false);
        this.setAlwaysOnTop(!!pref.ALWAYS_ON_TOP_ON_STARTUP);
        this.setPlaylistStyleSimple(!!pref.PLAYLIST_STYLE_SIMPLE_ON_STARTUP);
        this.setRemoveOnFinish(('REMOVE_ON_FINISH_ON_STARTUP' in pref) ? !!pref.REMOVE_ON_FINISH_ON_STARTUP : true);
        this.setUseHistory(('USE_HISTORY_ON_STARTUP' in pref) ? !!pref.USE_HISTORY_ON_STARTUP : true);
        this.wnpCore.observeInterval = Number(pref.OBSERVE_INTERVAL) || 500;
        this.pageTimeout = Number(pref.PAGE_TIMEOUT) || 80;
        this.videoTimeout = Number(pref.VIDEO_TIMEOUT) || 60;
        this.offTimer = Number(pref.OFFTIMER) || 120;
        this.wnpCore.errorWhenDeleted = !!pref.SKIP_DELETED_MOVIE;
        this.loopBreakCount = Number(pref.LOOP_BREAK_COUNT) || 0;
        this.playlist = { items: [], video: {}, title: {}, image: {} };
        this.isForceFilled = true; // fill on startup.
        this.lastOperationTime = new Date();
        this.lastUpdate = 0;
        this.menuCount = new ListElementIterator(this.wnpWindow.document.getElementById('WNP_MENU_CONTAINER')).count();
        this.menuHide();
    };
    WNP.prototype.build = function() {
        var d = this.wnpWindow.document;
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
        $e(d.getElementById('WNP_C_LOOP')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.setLoop(!self.isLoop);
        }, false);
        $e(d.getElementById('WNP_C_NICO_REPEAT')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.setRepeat(!self.wnpCore.isRepeat);
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
        $e(d.getElementById('WNP_C_PLAYLIST')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.playlistToggle();
        }, false);
        $e(d.getElementById('WNP_C_HISTORY')).addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            self.historyToggle();
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
        $e(d.getElementById('WNP_C_REMOVE_ON_FINISH')).addEventListener('click', function(e) {
            e.stopPropagation();
            self.setRemoveOnFinish(e.currentTarget.checked);
        }, false);
        $e(d.getElementById('WNP_C_USE_HISTOPRY')).addEventListener('click', function(e) {
            e.stopPropagation();
            self.setUseHistory(e.currentTarget.checked);
        }, false);
        $e(d.getElementById('WNP_FOOTER')).addEventListener('click', function(e) {
            self.wnpCore.setControlShowing(!self.wnpCore.isControlShowing);
        }, false);
        $e(d.getElementById('WNP_FOOTER')).addEventListener('mouseover', function(e) {
            self.restoreControlPanel();
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
        $e(d.getElementById('WNP_MENU_SLIDER')).addEventListener('mousedown', function(e) {
            e.stopPropagation();
            e.preventDefault();
            self.isSliding = true;
            d.getElementById('WNP_MENU_SLIDER').style.backgroundColor = '#696969';
            d.body.style.cursor = 'e-resize';
        }, false);
        $e(d).addEventListener('mousemove', function(e) {
            if (self.isSliding) {
                e.preventDefault(); // for ie.
            }
        }, false);
        $e(d).addEventListener('mouseup', function(e) {
            if (!self.isSliding) return;
            self.isSliding = false;
            d.getElementById('WNP_MENU_SLIDER').style.backgroundColor = '';
            d.body.style.cursor = '';
            var w = self.wnpWindow.innerWidth || ie.clientWidth(d);
            var x = e.clientX;
            var ratio = Math.ceil((1 - x / w) * 100);
            if (ratio < 10) ratio = 10;
            if (ratio > 100) ratio = 100;
            self.menuWidthRatio = ratio;
            self.menuShow();
        }, false);
        $e(d).addEventListener((browser.ie || browser.webkit) ? 'keydown' : 'keypress', function(e) {
            self.lastOperationTime = new Date();
            if (e.keyCode == 27) { // Esc
                self.restoreControlPanel();
                self.scheduleCancel();
                e.preventDefault();
                if (self.isSliding) {
                    self.isSliding = false;
                    d.getElementById('WNP_MENU_SLIDER').style.backgroundColor = '';
                    d.body.style.cursor = '';
                }
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
                self.seek(15);
                e.preventDefault();
            }
            if (e.keyCode == 37) { // left
                if (e.ctrlKey) self.seek(Number.NEGATIVE_INFINITY);
                else           self.seek(-15);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 'j') {
                if (!self.selectionIterator.item) {
                    self.selectionIterator.current(self.playlistIterator.item);
                }
                self.selectionIterator.next().isNullThenFirst();
                if (self.selectionIterator.item == null) return;
                self.listUtil.select(self.selectionIterator.item);
                self.scrollPlaylistTo(self.selectionIterator.item);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 'k') {
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
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 's') {
                self.scrollMenuItem(self.currentMenuIndex + 1);
            }
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 'a') {
                self.scrollMenuItem(self.currentMenuIndex - 1);
            }
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 'o') {
                if (self.selectionIterator && self.selectionIterator.item) {
                    self.playlistIterator.current(self.selectionIterator.item);
                    self.play();
                }
                e.preventDefault();
            }
            if (e.keyCode == 46) { // DEL
                if (self.selectionIterator && self.selectionIterator.item) {
                    var item = self.selectionIterator.item;
                    self.selectionIterator.next();
                    self.remove(item);
                    self.selectionIterator.isNullThenLast();
                    self.listUtil.select(self.selectionIterator.item);
                    self.scrollPlaylistTo(self.selectionIterator.item);
                }
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 'n') {
                self.playlistToggle();
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 'h') {
                self.historyToggle();
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 'c') {
                self.setCommentOff(!self.isCommentOff);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 'l') {
                self.setLoop(!self.isLoop);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 'r') {
                self.setRepeat(!self.wnpCore.isRepeat);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 'm') {
                self.setMute(!self.wnpCore.isMute);
                e.preventDefault();
            }
            if (String.fromCharCode(e.keyCode||e.which).toLowerCase() == 'v') {
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
        listUtil.addEventListener('dragend', function() {
            self.updatePlaylistURI();
        });
        listUtil.addEventListener('select', function() {
            self.selectionIterator.current(listUtil.selectedItems[0]);
        });
        listUtil.addEventListener('itemover', function(e) {
            var playinfo = createPlayInfo(e.item);
            self.showStatus(playinfo.title[playinfo.items[0]], 5);
        });
        listUtil.addEventListener('itemout', function(e) {
            self.clearStatus();
        });
        listUtil.hoverColor = Colors.item_hover;
        listUtil.selectedColor = Colors.item_selected;
        listUtil.draggingColor = Colors.item_dragging;

        this.listUtil = listUtil;
        this.timer = new TimerManager(this.wnpWindow);
        this.preloads = new ListedKeyMap();
    };
    WNP.prototype.seek = function(time) {
        this.wnpCore.seek(time);
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
        this.showControlPanel();
    };
    WNP.prototype.showControlPanel = function() {
        this.clearStatus();
        this.updateControlPanelStatus();
        var controlPanel = this.wnpWindow.document.getElementById('WNP_CONTROL_PANEL');
        controlPanel.style.visibility = 'visible';
        this.timer.setTimeout('controlPanel', function(){
            controlPanel.style.visibility = '';
        }, 3000);
    };
    WNP.prototype.hideControlPanel = function() {
        this.timer.clear('controlPanel');
        var controlPanel = this.wnpWindow.document.getElementById('WNP_CONTROL_PANEL');
        controlPanel.style.visibility = 'hidden';
    };
    WNP.prototype.updateControlPanelStatus = function() {
        var cur = this.wnpCore.current();
        var len = this.wnpCore.length();
        this.wnpWindow.document.getElementById('WNP_C_NICO_SEEKBAR').firstChild.firstChild.style.width = (len ? Math.ceil(cur / len * 100) + '%' : '0');
        var vol = this.wnpCore.volume() || 0;
        this.wnpWindow.document.getElementById('WNP_C_NICO_VOLUMEBAR').firstChild.firstChild.style.width = Math.ceil(vol / 100 * 100) + '%';
    };
    WNP.prototype.observingVideoStart = function() {
        var self = this;
        this.timer.setInterval('observingVideo', function() {
            self.updateControlPanelStatus();
        }, 1000);
    };
    WNP.prototype.observingVideoStop = function() {
        this.timer.clear('observingVideo');
    };
    WNP.prototype.restoreControlPanel = function() {
        this.timer.clear('controlPanel');
        var controlPanel = this.wnpWindow.document.getElementById('WNP_CONTROL_PANEL');
        controlPanel.style.visibility = '';
    };
    WNP.prototype.setLoop = function(loop) {
        this.isLoop = loop;
        var button = this.wnpWindow.document.getElementById('WNP_C_LOOP');
        if (this.isLoop) button.style.color = Colors.control_loop;
        else             button.style.color = '';
    };
    WNP.prototype.setRepeat = function(repeat) {
        this.wnpCore.setRepeat(repeat);
        var button = this.wnpWindow.document.getElementById('WNP_C_NICO_REPEAT');
        if (repeat) button.style.color = Colors.control_repeat;
        else        button.style.color = '';
        this.showControlPanel();
    };
    WNP.prototype.setCommentOff = function(off) {
        this.isCommentOff = !!off;
        this.wnpCore.setCommentOff(this.isCommentOff);
        var button = this.wnpWindow.document.getElementById('WNP_C_NICO_COMM');
        if (this.isCommentOff) {
            button.style.color = Colors.control_comment_off;
            button.style.textDecoration = 'line-through';
        }
        else {
            button.style.color = '';
            button.style.textDecoration = '';
        }
        this.showControlPanel();
    };
    WNP.prototype.setMute = function(mute) {
        this.wnpCore.setMute(mute);
        var button = this.wnpWindow.document.getElementById('WNP_C_NICO_MUTE');
        if (mute) {
            button.style.color = Colors.control_mute;
            button.style.textDecoration = 'line-through';
        }
        else {
            button.style.color = '';
            button.style.textDecoration = '';
        }
        this.showControlPanel();
    };
    WNP.prototype.setAlwaysOnTop = function(alwaysOnTop) {
        this.isAlwaysOnTop = alwaysOnTop;
        var button = this.wnpWindow.document.getElementById('WNP_C_ALWAYS_ON_TOP');
        if (this.isAlwaysOnTop) button.style.color = Colors.control_always_on_top;
        else                    button.style.color = '';
    };
    WNP.prototype.setPlaylistStyleSimple = function(simple) {
        if (!this._simplePlaylistStyle) {
            var simple_style_str = [
                'ul.wnp_playlist_items li div.video_info img.thumbnail { display: none }',
                'ul.wnp_playlist_items li div.video_info { width: 10px }',
                'ul.wnp_playlist_items li { height: 25px }',
                'ul.wnp_playlist_items li div.video_desc * { display: none }',
                'ul.wnp_playlist_items li div.video_desc a { display: inline }',
                /*@cc_on 'ul.wnp_playlist_items li img.wnp_iecover { height: 28px; }', @*/
            ].join('\n');
            var style = addStyle(simple_style_str, this.wnpWindow.document);
            this._simplePlaylistStyle = style;
        }
        this._simplePlaylistStyle.disabled = !simple;
        if (this._simplePlaylistStyle.sheet) this._simplePlaylistStyle.sheet.disabled = !simple; // webkit.
        this.wnpWindow.document.getElementById('WNP_C_PLAYLIST_STYLE').checked = simple;
    };
    WNP.prototype.setRemoveOnFinish = function(rof) {
        this.wnpWindow.document.getElementById('WNP_C_REMOVE_ON_FINISH').checked = rof;
    };
    WNP.prototype.setUseHistory = function(use) {
        this.wnpWindow.document.getElementById('WNP_C_USE_HISTOPRY').checked = use;
    };
    WNP.prototype.menuToggle = function() {
        if (this.isMenuShowing) {
            this.menuHide();
        }
        else {
            this.playlistToggle(); // default menu.
        }
    };
    WNP.prototype.playlistToggle = function() {
        this.toggleMenuItem(0);
    };
    WNP.prototype.historyToggle = function() {
        this.toggleMenuItem(1);
    };
    WNP.prototype.toggleMenuItem = function(index) {
        if (this.currentMenuIndex === index) {
            if (this.isMenuShowing) this.menuHide();
            else                    this.menuShow();
        }
        else {
            this.showMenuItem(index);
        }
    };
    WNP.prototype.scrollMenuItem = function(index) {
        if (!this.isMenuShowing) {
            if (index >= 0) {
                this.showMenuItem(0);
            }
            else {
                this.showMenuItem(this.menuCount - 1);
            }
        }
        else {
            if (this.isMenuShowing && (index < 0 || index >= this.menuCount)) {
                this.menuHide();
            }
            else {
                if (this.menuSoar && this.menuSoar.isActive) {
                    this.menuSoar.cancel();
                }
                if (!this.menuSoar) {
                    var menuContainer = this.wnpWindow.document.getElementById('WNP_MENU_CONTAINER');
                    this.menuSoar = new Soar(menuContainer.style);
                    this.menuSoar.from({marginLeft: '0.0%'});
                }
                if (browser.mozilla) {
                    this.showMenuItem(index);
                }
                else {
                    this.menuSoar.to({marginLeft: -(100 * index) + '.0%'}).go(this.wnpWindow);
                    this.currentMenuIndex = index;
                }
            }
        }
    };
    WNP.prototype.showMenuItem = function(index) {
        if (index < 0) index = 0;
        if (index >= this.menuCount) index = this.menuCount - 1;
        var menuContainer = this.wnpWindow.document.getElementById('WNP_MENU_CONTAINER');
        menuContainer.style.marginLeft = -(100 * index) + '%';
        if (!this.isMenuShowing) this.menuShow();
        this.currentMenuIndex = index;
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
        this.currentMenuIndex = -1;
    };
    WNP.prototype.addEx = function(playlist, option) {
        var opt = option || {};
        this.lastOperationTime = new Date();
        var start = opt.start && (new Date() - this.lastUpdate >= 1000); // ignore start when last update within 1sec.
        var startPoint = wnp.playlist.items.length; // add point.
        var newList = null;
        if (/^(?:http:\/\/www\.nicovideo\.jp\/watch\/)?((?:[a-z]{2})?[0-9]+)/.test(playlist.toString())) {
            newList = {items: [RegExp.$1], video: {}, title: {}, image: {}};
        }
        else if (/^http:\/\/www\.nicovideo\.jp\/.*/.test(playlist.toString())) {
            var self = this;
            createPlayInfoFromUrl(playlist.toString(), function(playlist) {
                self.addEx(playlist, option);
            });
            return;
        }
        else {
            newList = playlist;
        }
        var document = this.wnpWindow.document;
        var ul = document.getElementById('WNP_PLAYLIST_ITEMS');
        var df = document.createDocumentFragment();
        for (var i = 0; i < newList.items.length; i++) {
            var videoinfo = createVideoInfo(newList, i);
            var li = this.createPlaylistItem(videoinfo);
            df.appendChild(li);
        }
        var firstItem = df.firstChild;
        if (opt.type == 'insertBeforeCurrent') {
            var target = this.playlistIterator.item || ul.firstChild;
            ul.insertBefore(df, target);
        }
        else if (opt.type == 'insertAfterCurrent') {
            var target = this.playlistIterator.item || ul.firstChild;
            ul.insertBefore(df, target ? target.nextSibling : null);
        }
        else {
            ul.appendChild(df);
        }
        if (start && firstItem) {
            var self = this;
            this.wnpWindow.setTimeout(function() {
                self.lastOperationTime = 0; // scroll to start point by force.
                self.play(self.playlistIterator.indexOf(firstItem));
                self.lastOperationTime = new Date();
            }, 0); // for firefox exception.
        }
        this.updatePlaylistURI();
    };
    WNP.prototype.addHistory = function(newList) {
        if (!newList) return;
        var document = this.wnpWindow.document;
        var ul = document.getElementById('WNP_HISTORY_ITEMS');
        var df = document.createDocumentFragment();
        var items = newList.items;
        for (var i = 0; i < items.length; i++) {
            var videoInfo = createVideoInfo(newList, i);
            var li = this.createPlaylistItem(videoInfo, true);
            df.appendChild(li);
        }
        ul.appendChild(df);
    };
    WNP.prototype.createPlaylistItem = function(info, forHistory) {
        var wnpDocument = this.wnpWindow.document;
        var li = wnpDocument.createElement('li');
        var url = info.url;
        if (!url) url = 'http://www.nicovideo.jp/watch/' + info.id;
        var title = info.title || info.id;
        var thumbnail = info.thumbnail || 'http:\/\/tn-skr2.smilevideo.jp/smile?i=' + info.id.slice(2);
        li.innerHTML = [
            /*@cc_on '<img src=' + Consts.WNP_IMAGE_EMPTY + ' class="wnp_iecover">', @*/ // http://d.hatena.ne.jp/miya2000/20070306/p0
            '<div class="video_info">',
            '  <span class="playmark">\u25C6</span>',
            '  <a href="' + url + '" title="' + title + '" target="nico_frame">',
            '    <img class="thumbnail" name="' + info.id + '" src="' + thumbnail + '" width="65" height="50" alt="' + title + '">',
            '  </a>',
            '</div>',
            '<div class="video_desc">',
            '  <a href="' + url + '" name="' + info.id + '" title="' + title + '" target="nico_frame">' + title + '</a><br>',
            '  <button>\u00D7</button>',
            '</div>',
        ].join('');
        var self = this, playThis, removeThis;
        var playThis = function(e) {
            self.play(self.playlistIterator.indexOf(li));
            e.preventDefault();
        };
        var removeThis = function(e) {
            self.remove(li);
            e.preventDefault();
        };
        if (forHistory) {
            playThis = function(e) {
                WNP.play(createPlayInfo(li));
                li.parentNode.removeChild(li);
                e.preventDefault();
            };
            removeThis = function(e) {
                li.parentNode.removeChild(li);
                e.preventDefault();
            };
        }
        var ancs = li.getElementsByTagName('a');
        for (var i = 0; i < ancs.length; i++) $e(ancs[i]).addEventListener('click', playThis, false);
        var desc = li.lastChild;
        $e(desc.getElementsByTagName('button')[0]).addEventListener('click', removeThis, false);
        return li;
    };
    WNP.prototype.clear = function() {
        this.playlist = {items: [], video: {}, title: {}, image: {} };
        var ul = this.wnpWindow.document.getElementById('WNP_PLAYLIST_ITEMS');
        while(ul.lastChild) ul.removeChild(ul.lastChild);
        this.updatePlaylistURI();
    };
    WNP.prototype.remove = function(item) {
        this.removePreload(createVideoInfo(createPlayInfo(item)));
        var ul = this.wnpWindow.document.getElementById('WNP_PLAYLIST_ITEMS');
        if (item.parentNode === ul) {
            if (item === this.playlistIterator.item) {
                // cutting corners.
                var dummy = this.wnpWindow.document.createTextNode('');
                ul.insertBefore(dummy, item);
                this.playlistIterator.current(dummy)
            }
            ul.removeChild(item);
        }
        this.updatePlaylistURI();
    };
    WNP.prototype.updatePlaylistURI = function() {
        this.timer.clear('updatePlaylistURI');
        var self = this;
        this.timer.setTimeout('updatePlaylistURI', function() {
            var document = self.wnpWindow.document;
            var items = document.getElementById('WNP_PLAYLIST_ITEMS');
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
            self.playlist = playlist;
            var save = document.getElementById('WNP_C_PLAYLIST_URI');
            save.href = 'javascript:' + encodeURIComponent(Consts.WNP_GLOBAL_NAME + '.open(' + toJSON(playlist) + ')');
            var date = new Date();
            save.title = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + '.pls';
            save.firstChild.alt = save.title;
            self.updatePrevAndNext();
            self.lastUpdate = new Date();
            //self.updateAlternativeView();
        }, 2000);
    };
    WNP.prototype.updatePrevAndNext = function() {
        var wnpDocument = this.wnpWindow.document;
        var currentItem = this.playlistIterator.item;
        var itr = new ListElementIterator(wnpDocument.getElementById('WNP_PLAYLIST_ITEMS'));
        var button = wnpDocument.getElementById('WNP_C_PREV');
        if (itr.previous(currentItem).item) {
            var playinfo = createPlayInfo(itr.item);
            this.bindVideoInfo(button, playinfo.video[playinfo.items[0]], playinfo.title[playinfo.items[0]]);
        }
        else {
            this.unbindVideoInfo(button);
        }
        var button = wnpDocument.getElementById('WNP_C_NEXT');
        if (itr.next(currentItem).item) {
            var playinfo = createPlayInfo(itr.item);
            this.bindVideoInfo(button, playinfo.video[playinfo.items[0]], playinfo.title[playinfo.items[0]]);
        }
        else{
            this.unbindVideoInfo(button);
        }
    };
    WNP.prototype.bindVideoInfo = function(a, url, title) {
        a.href = url;
        var self = this;
        a.onmouseover = function() {
            self.showStatus(title, 5);
        };
        a.onmouseout = function() {
            self.clearStatus();
        };
    };
    WNP.prototype.unbindVideoInfo = function(a) {
        a.href = 'about:blank';
        a.onmouseover = null;
        a.onmouseout = null;
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
        if (this.wnpCore.isPausing) {
            this.wnpCore.resume();
        }
        else {
            this.wnpCore.pause();
        }
        this.updatePauseButton();
    };
    WNP.prototype.updatePauseButton = function() {
        var button = this.wnpWindow.document.getElementById('WNP_C_NICO_PAUSE');
        if (this.wnpCore.isPausing || !this.wnpCore.isPlaying) {
            button.innerHTML = '<img src="' + Consts.WNP_IMAGE_PLAY + '">';
        }
        else {
            button.innerHTML = '<img src="' + Consts.WNP_IMAGE_PAUSE + '">';
        }
    };
    WNP.prototype.scrollPlaylistTo = function(item) {
        if (this.scrollSoar != null) {
            this.scrollSoar.cancel();
        }
        var list = this.wnpWindow.document.getElementById('WNP_PLAYLIST_ITEMS');
        this.scrollSoar = new Soar(list);
        var allowance = item.offsetHeight; // 1row.
        this.scrollSoar
            .to({scrollTop: Math.min(Math.max(item.offsetTop - list.clientTop - allowance, 0), list.scrollHeight - list.clientHeight)})
            .go(this.wnpWindow);
        var self = this;
        this.scrollSoar.addEventListener('finish', function() {
            self.scrollSoar = null;
        });
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
        var videoinfo = createVideoInfo(playinfo);
        var title = videoinfo.title;
        
        if (this.wnpCore.isPlaying && this.wnpCore.videoinfo.id == videoinfo.id) {
            this.wnpCore.layout();
            this.wnpCore.seekTo(0);
            this.wnpCore.resume();
            return;
        }

        this.scheduleCancel();
        this.observingVideoStop();
        this.timer.clear('preload');

        var self = this;
        
        var preloaded = this.preloads.has(videoinfo.id);
        if (preloaded) {
            var oldCore = this.wnpCore;
            this.wnpCore = this.preloads.get(videoinfo.id);
            this.preloads.remove(videoinfo.id);
            this.wnpCore.style = oldCore.style;
            this.wnpCore.seekTo(0);
            this.wnpCore.setCommentOff(oldCore.isCommentOff);
            this.wnpCore.setMute(oldCore.isMute);
            //this.wnpCore.setRepeat(oldCore.isRepeat);
            //this.wnpCore.volumeTo(oldCore.volume());
            oldCore.detach();
            this.wnpCore.show();
        }

        this.wnpWindow.setTimeout(function() {
            if (preloaded) {
                self.wnpCore.resume();
                if (!self.wnpCore.isLoading) { // already loaded.
                    self.wnpCore.onload();
                    self.wnpCore.onstart();
                }
            }
            else {
                self.wnpCore.play(videoinfo);
            }
            if (videoinfo.title) {
                self.wnpWindow.document.title = title + ' - ' + Consts.WNP_TITLE;
                self.showStatus(title, 5);
            }
            self.updatePauseButton();
        }, 500); // for smooth scroll.
        if (!browser.ie) this.setAlternativeView(videoinfo);

        // timeout, etc.
        this.timer.setTimeout('playTimeout', function() {
            self.showStatus("load timeout. go to next.", 5);
            self.next();
        }, this.pageTimeout * 1000 + 500);
        this.wnpCore.onload = function() {
            self.timer.setTimeout('playTimeout', function() {
                self.showStatus("play timeout. go to next.", 5);
                self.next();
            }, self.videoTimeout * 1000);
            // show actual title.
            if (!title || title == videoinfo.id) {
                title = self.wnpCore.videoinfo.title;
                self.wnpWindow.document.title = title + ' - ' + Consts.WNP_TITLE;
                self.showStatus(title, 5);
            }
            // update title and thumbnail image.
            var video_id = self.wnpCore.videoinfo.id;
            var thumbnail = self.wnpCore.videoinfo.thumbnail;
            var elements = self.wnpWindow.document.getElementsByName(video_id);
            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                if (el.nodeName == 'IMG') {
                    if (el.src != thumbnail) el.src = thumbnail;
                    el.setAttribute('alt', title);
                }
                if (el.nodeName == 'A') {
                    el.setAttribute('title', title);
                    el.textContent = /*@cc_on el.innerText = @*/ title;
                }
            }
            self.updatePlaylistURI();
            self.timer.setTimeout('preload', function() {
                self.preloadNext();
            }, 30000);
        };
        this.wnpCore.onstart = function() {
            self.updateAlternativeView();
            self.timer.clear('playTimeout');
            self.observingVideoStart();
            if (browser.opera) {
                // force visit.
                self.wnpWindow.setTimeout(function() {
                    var w = self.wnpWindow.open(videoinfo.url, '', 'width=1,height=1,menubar=no,toolbar=no,scrollbars=no,top=0,left=10000');
                    w.blur();
                    self.wnpWindow.setTimeout(function() { w.close(); }, 800);
                    self.wnpWindow.setTimeout(function() { if (!w.closed) w.close(); }, 3000);
                }, 5000);
            }
        };
        this.wnpCore.onerror = function(e) {
            self.showStatus((e.message || 'error.') + ' go to next.', 5);
            self.next();
        };
        this.wnpCore.onfinish = function() {
            if (self.wnpWindow.document.getElementById('WNP_C_USE_HISTOPRY').checked) {
                var playinfo = createPlayInfo(currentItem);
                self.addHistory(playinfo);
            }
            if (self.wnpWindow.document.getElementById('WNP_C_REMOVE_ON_FINISH').checked) {
                self.remove(currentItem);
            }
            if ((new Date() - (self.lastOperationTime || 0)) > self.offTimer * 60 * 1000) {
                self.stop();
            }
            else {
                self.next();
            }
        };
        this.wnpCore.onback = (function() {
            var backCount = 0;
            return function() {
                if (self.wnpCore.isRepeat) {
                    backCount = 0;
                    return;
                }
                if (!new Date() - (self.lastOperationTime || 0) > 5000) {
                    backCount++;
                }
                else {
                    backCount = 0;
                }
                if (self.loopBreakCount > 0 && backCount >= self.loopBreakCount) {
                    self.wnpCore.onfinish();
                }
            }
        })();
        
        appendClass(this.wnpElement, 'playing');
        appendClass(currentItem, 'playing');
        this.playingItem = currentItem;

        this.updatePrevAndNext();
        if ((new Date() - (this.lastOperationTime || 0)) > 10000) {
            this.scrollPlaylistTo(currentItem);
        }
    };
    WNP.prototype.stop = function() {
        this.wnpCore.stop();
        this.scheduleCancel();
        this.observingVideoStop();
        var wnpDocument = this.wnpWindow.document;
        wnpDocument.title = Consts.WNP_TITLE;
        removeClass(this.wnpElement, 'playing');
        if (this.playingItem) removeClass(this.playingItem, 'playing');
        this.updatePauseButton();
        this.wnpWindow.document.getElementById('WNP_C_NICO_SEEKBAR').firstChild.firstChild.style.width = '0';
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
        var playinfo = createPlayInfo(this.scheduleIterator.item);
        this.showStatus("next: " + playinfo.title[playinfo.items[0]], 3);
        var self = this;
        this.timer.setTimeout('schedulePlay', function() {
            self.timer.clear('schedulePlay');
            if (self.playlistIterator.item === self.scheduleIterator.item) {
                self.scheduleIterator = null;
                return;
            }
            self.playlistIterator.current(self.scheduleIterator.item);
            self.scheduleIterator = null;
            self.play();
        }, 3000);
    };
    WNP.prototype.scheduleCancel = function() {
        if (this.timer.timeouts['schedulePlay']) {
            this.timer.clear('schedulePlay');
            this.showStatus("cancel.", 3);
        }
        this.scheduleIterator = null;
    };
    WNP.prototype.preloadNext = function() {
        var preloadIterator = new ListElementIterator(this.wnpWindow.document.getElementById('WNP_PLAYLIST_ITEMS')).current(this.playlistIterator.item).next();
        if (this.isLoop) preloadIterator.isNullThenLast();
        var nextItem = preloadIterator.item;
        this.timer.clear('preload');
        if (!nextItem || this.wnpCore.loaded() < 1) {
            var self = this;
            this.timer.setTimeout('preload', function() {
                self.preloadNext();
            }, 3000);
            return;
        }
        this.preload(createVideoInfo(createPlayInfo(nextItem)));
    };
    WNP.prototype.preload = function(videoinfo) {
        var preloads = this.preloads;
        if (preloads.has(videoinfo.id)) return;
        while (preloads.count() >= 2) {
            preloads.getAt(0).detach();
            preloads.removeAt(0);
        }
        var wnpCore = new WNPCore(this.wnpWindow.document);
        preloads.add(videoinfo.id, wnpCore);
        wnpCore.observeInterval = this.wnpCore.observeInterval;
        wnpCore.errorWhenDeleted = this.wnpCore.errorWhenDeleted;
        wnpCore.hide();
        wnpCore.onerror = function() {
            wnpCore.detach();
            preloads.remove(videoinfo.id);
        };
        this.wnpWindow.document.getElementById('WNP_VIEW').appendChild(wnpCore.element);
        wnpCore.play(videoinfo);
        wnpCore.pause();
        wnpCore.setMute(true);
    };
    WNP.prototype.removePreload = function(videoinfo) {
        if (this.preloads.has(videoinfo.id)) {
            this.preloads.get(videoinfo.id).detach();
            this.preloads.remove(videoinfo.id);
        }
    };
    WNP.prototype.clearPreloads = function() {
        for (var i = 0, len = this.preloads.count(); i < len; i++) {
            var wnpCore = this.preloads.getAt(i);
            if (wnpCore !== this.wnpCore) {
                wnpCore.detach();
            }
        }
        this.preloads = ListedKeyMap();
    };
    WNP.prototype.layoutToggle = function() {
        var nextStyle;
        switch (this.wnpCore.style) {
        case WNPCore.STYLE_FILL:    nextStyle = WNPCore.STYLE_RESTORE;   break;
        case WNPCore.STYLE_RESTORE: nextStyle = WNPCore.STYLE_ALTERNATE; break;
        default:                    nextStyle = WNPCore.STYLE_FILL;      break;
        }
        this.wnpCore.style = nextStyle;
        this.wnpCore.layout();
    };
    WNP.prototype.clearStatus = function() {
        var statusBar = this.wnpWindow.document.getElementById('WNP_STATUS_BAR');
        statusBar.innerHTML = '';
    };
    WNP.prototype.showStatus = function(msg, sec, error) {
        var statusBar = this.wnpWindow.document.getElementById('WNP_STATUS_BAR');
        this.timer.clear('clearStatusMessage');
        if (error) {
            statusBar.style.backgroundColor = Colors.status_error;
            statusBar.style.fontWeight = 'bold';
        }
        else {
            statusBar.style.backgroundColor = '';
            statusBar.style.fontWeight = '';
        }
        this.hideControlPanel();
        statusBar.textContent = /*@cc_on statusBar.innerText = @*/ msg;
        if (sec) {
            var self = this;
            this.timer.setTimeout('clearStatusMessage', function(){
                self.clearStatus();
                self.restoreControlPanel();
            }, sec * 1000);
        }
    };
    WNP.prototype.setAlternativeView = function(info) {
        var iframe = this.wnpWindow.document.createElement('iframe');
        iframe.setAttribute('scrolling', 'no');
        this.alternativeView = iframe;
        this.updateAlternativeView(info);
        this.wnpCore.setAlternativeView(iframe, 380, 230);
    };
    WNP.prototype.updateAlternativeView = function(info) {
        if (!this.alternativeView) return;
        var videoinfo = info || this.wnpCore.videoinfo;
        if (!videoinfo) return;
        var thumb_url = videoinfo.thumbnail || 'about:blank';
        var title    = escapeHTML(videoinfo.title || videoinfo.id || '', this.wnpWindow.document);
        var total = this.playlistIterator.count();
        var current = this.playlistIterator.indexOf(this.playlistIterator.item) + 1;
        var video_play, video_comment, video_mylist;
        if (videoinfo.viewCount != null) {
            video_play    = formatNumber(Number(videoinfo.viewCount));
            video_comment = formatNumber(this.wnpCore.commentNum());
            video_mylist  = formatNumber(videoinfo.mylistCount);
        }
        else {
            video_play = video_comment = video_mylist = '';
        }
        var svg_xml = Consts.svg_xml_base.replace(/%.+?%/g, function(r) {
            if (r == '%u%') return thumb_url;
            if (r == '%t%') return title;
            if (r == '%c%') return current + ' / ' + total;
            if (r == '%vp%') return video_play;
            if (r == '%vc%') return video_comment;
            if (r == '%vm%') return video_mylist;
            return '';
        });
        var svg_url = 'data:' + Consts.svg_mime_type + ';charset=utf-8,' + encodeURIComponent(svg_xml);
        this.alternativeView.src = 'about:blank';
        this.alternativeView.src = svg_url;
    };
    WNP.open = function(playlist) {
        if (playlist) this.play(playlist);
    };
    WNP.play = function(playlist) {
        if (playlist) this.wnp().addEx(playlist, { start: true, type: 'insertBeforeCurrent' });
    };
    WNP.add = function(playlist, name, start) {
        if (playlist) this.wnp().addEx(playlist);
    };
    WNP.insert = function(playlist, name) {
        if (playlist) this.wnp().addEx(playlist, { start: false, type: 'insertAfterCurrent' });
    };
    WNP.wnp = function() {
        return window.wnp;
    };
    WNP.initialize = function(pref) {
        window.wnp = new WNP(pref);
    };
    T.WNP = WNP;
    window[Consts.WNP_GLOBAL_NAME] = WNP;
}
WNP.BUILD_WNP = BUILD_WNP;

    // WNP entry point.
    WNP.open = function(playlist, name) {
        var wnpWindow = this.wnp(name);
        if (playlist) {
            setTimeout(function() {
                wnpWindow[Consts.WNP_GLOBAL_NAME].open(playlist);
            }, 50);
        }
    };
    WNP.play = function(playlist, name) {
        var wnpWindow = this.wnp(name);
        if (!playlist) playlist = createPlayInfo(document.getElementsByTagName('body')[0]);
        wnpWindow[Consts.WNP_GLOBAL_NAME].play(playlist);
    };
    WNP.add = function(playlist, name, start) {
        var wnpWindow = this.wnp(name);
        if (!playlist) playlist = createPlayInfo(document.getElementsByTagName('body')[0]);
        wnpWindow[Consts.WNP_GLOBAL_NAME].add(playlist);
    };
    WNP.insert = function(playlist, name, start) {
        var wnpWindow = this.wnp(name);
        if (!playlist) playlist = createPlayInfo(document.getElementsByTagName('body')[0]);
        wnpWindow[Consts.WNP_GLOBAL_NAME].insert(playlist);
    };
    WNP.wnp = function(name) {
        var loc = 'javascript:void(0)'; /*@cc_on loc = ''; @*/;
        var w = window.open(loc, name || 'wnp', 'top=0,left=' + ((window.innerWidth || ie.clientWidth()) - WNP.Prefs.WIDTH) + ',width=' + WNP.Prefs.WIDTH + ',height=' + this.Prefs.HEIGHT + ',scrollbars=yes,resizable=yes,menubar=yes,status=no');
        var wnp = w.wnp;
        if (wnp == null) {
            var html = WNP.html();
            var d = w.document;
            d.open();
            d.write(html);
            try { d.close(); } catch(e) {}
            w[Consts.WNP_GLOBAL_NAME].initialize(WNP.Prefs);
        }
        w.focus();
        return w;
    };
    WNP.showToolTipIfNecessary = (function() {
        var tooltip = null;
        var tid = null;
        var pls = null;
        return function showToolTipIfNecessary(target) {
            var a = target;
            while(a) {
                if (a.nodeName == 'A') break;
                a = a.parentNode;
            }
            if (!a) return;
            var m;
            if (m = /(http:\/\/www\.nicovideo\.jp\/watch\/(\w+))/.exec(a.href)) {
                pls = createPlayInfo(a);
            }
            else if (/^http:\/\/www\.nicovideo\.jp\/.*/.test(a.href)) {
                pls = a.href;
            }
            else {
                return;
            }
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'wnp_tooltip';
                var panel_html = [
                    '<a href="javascript:void(0)" rel="nofollow"><span>play</span></a>',
                    '<a href="javascript:void(0)" rel="nofollow"><span>add</span></a>',
                    '<a href="javascript:void(0)" rel="nofollow"><span>insert</span></a>'
                ].join('');
                if (browser.mozilla) {
                    var bk = '<img src="about:blank" style="display:none"><br style="display:none">';
                    panel_html = panel_html.replace(/<span>/g, bk + '<span>');
                }
                tooltip.innerHTML = panel_html;
                $e(window).addEventListener('mouseup', function(e) { tooltip.style.display = 'none'; }, false);
                $e(window).addEventListener(browser.mozilla ? 'DOMMouseScroll' : 'mousewheel', function(e) {
                    tooltip.style.display = 'none';
                }, false);
                var an = tooltip.getElementsByTagName('a');
                $e(an[0]).addEventListener('click', function(e) { e.preventDefault(); if (pls) WNP.play(pls); }, false);
                $e(an[1]).addEventListener('click', function(e) { e.preventDefault(); if (pls) WNP.add(pls); }, false);
                $e(an[2]).addEventListener('click', function(e) { e.preventDefault(); if (pls) WNP.insert(pls); }, false);
                document.getElementsByTagName('body')[0].appendChild(tooltip);
            }
            else {
                // refresh.
                for (var i = 0, len = tooltip.childNodes.length; i < len; i++) {
                    var node = tooltip.childNodes[i];
                    if (node.innerHTML) node.innerHTML = node.innerHTML;
                }
            }

            var title = findVideoTitle(a) + ' - \u30CB\u30B3\u30CB\u30B3\u52D5\u753B';
            if (pls.title && !pls.title[pls.items[0]]) {
                pls.title[pls.items[0]] = title;
            }
            var open_href = 'javascript:' + encodeURIComponent('void((window.' + Consts.WNP_GLOBAL_NAME + ')?' + Consts.WNP_GLOBAL_NAME + '.open(' + toJSON(pls) + '):location.href="' + a.href +'")');
            var an = tooltip.getElementsByTagName('a');
            for (var i = 0; i < an.length; i++) {
                an[i].setAttribute('href', open_href);
                an[i].setAttribute('title', title);
            }
            if (browser.mozilla) {
                for (var i = 0; i < an.length; i++) {
                    an[i].firstChild.setAttribute('alt', title);
                }
            }

            var p = getAbsolutePosition(a);
            var x = p.x, y = p.y,
                w = a.offsetWidth, h = a.offsetHeight,
                width  = 80, height = 25;
            if (browser.mozilla || browser.webkit) {
                var thumb = a.getElementsByTagName('img')[0];
                if (thumb) {
                    var p = getAbsolutePosition(thumb);
                    x = Math.min(x, p.x);
                    y = Math.min(y, p.y);
                    w = Math.max(w, thumb.offsetWidth);
                    h = Math.max(h, thumb.offsetHeight);
                }
            }
            tooltip.style.left = Math.min(Math.max(x + Math.min(20, w-5), (x + w - width)), (window.innerWidth || ie.clientWidth()) - 190) + 'px';
            tooltip.style.top  = Math.min(y - 10, y + (h / 2) - 15 - height)  + 'px';
            tooltip.style.display = 'block';

            if (tid) clearTimeout(tid);
            tid = setTimeout(function() {
                if (getStyle(tooltip, 'opacity') == '1') { // why work on ie?
                    setTimeout(arguments.callee, 1000);
                    return;
                }
                tooltip.style.display = 'none';
                tid = null;
                pls = null;
            }, 3000);
        }
    })();
    WNP.showWnpControlPanel = function showWnpControlPanel() {
        var controlPanel = document.createElement('div');
        controlPanel.id = 'WNP_CONTAROL_PANEL';
        controlPanel.className = 'wnp_tooltip';
        controlPanel.style.cssText = 'position: fixed; bottom: 5px; right: 5px; width: 228px; z-index: 998; ';
        var open_href = 'javascript:' + encodeURIComponent('void((' + Consts.WNP_GLOBAL_NAME + ')?' + Consts.WNP_GLOBAL_NAME + '.open("' + location.href + '"):location.href="' + location.href + '")');
        var title = document.title;
        var panel_html = [
            '<a href="' + open_href + '" title="open WNP" rel="nofollow"><span>open</span></a>',
            '<a href="' + open_href + '" title="' + title + '" rel="nofollow"><span>play</span></a>',
            '<a href="' + open_href + '" title="' + title + '" rel="nofollow"><span>add</span></a>',
            '<a href="' + open_href + '" title="' + title + '" rel="nofollow"><span>insert</span></a>'
        ].join('');
        if (browser.mozilla) {
            var bk = '<img src="about:blank" style="display:none" alt="' + title + '"><br style="display:none">';
            panel_html = panel_html.replace(/<span>/g, bk + '<span>');
        }
        controlPanel.innerHTML = panel_html;
        var an = controlPanel.getElementsByTagName('a');
        $e(an[0]).addEventListener('click', function(e) { e.preventDefault(); WNP.open(); }, false);
        $e(an[1]).addEventListener('click', function(e) { e.preventDefault(); WNP.play(); }, false);
        $e(an[2]).addEventListener('click', function(e) { e.preventDefault(); WNP.add(); }, false);
        $e(an[3]).addEventListener('click', function(e) { e.preventDefault(); WNP.insert(); }, false);
        document.getElementsByTagName('body')[0].appendChild(controlPanel);
    };
    WNP.init = function init() {
        addStyle(WNP.pageStyle(WNP.Prefs));
        WNP.showWnpControlPanel();
        $e(document).addEventListener('mouseover', function(e) {
            WNP.showToolTipIfNecessary(e.target);
        }, false);
    }
    window[Consts.WNP_GLOBAL_NAME] = WNP;

    // entry point.
    function main() {
        WNP.init();
    }
    
    if (location.href.indexOf('http://www.nicovideo.jp/wnp/') === 0 && /^#(?:\w{2})?\d+$/.test(location.hash)) {
        var videoid = location.hash.replace(/^#/, '');
        // delay for ie8.
        setTimeout(function() {
            var html = WNP.html();
            document.open();
            document.write(html);
            try { d.close(); } catch(e) {}
            window.WNP.initialize(WNP.Prefs);
            window.WNP.open(videoid);
        }, 50);
    }
    else {
        if (document.getElementsByTagName('body')[0]) setTimeout(main, 0); // delay for customize.
        else if (window.opera) document.addEventListener('DOMContentLoaded', main, false);
        else                   $e(window).addEventListener('load', main, false);
    }
})();
