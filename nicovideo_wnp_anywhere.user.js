// ==UserScript==
// @name       wnp plugin - wnp anywhere
// @author     miya2000
// @namespace  http://www.hatena.ne.jp/miya2000/
// @version    0.00 beta
// @include    *
// ==/UserScript==
(function() {
    
    if (!document.body) return;
    
    var WNP_GATEWAY_URL = 'http://www.nicovideo.jp/mylist_add/';
    
    var WNP_ACCEPT_URL_LIST = [
        'http://fastladder.com/reader/',
        'http://reader.livedoor.com/reader/'
    ];
    
    // dispatch routine.
    if (/^http:\/\/\w+\.nicovideo\.jp/.test(location.href)) {
        if (location.href == WNP_GATEWAY_URL && window.parent != window) {
            prepareAnywhere();
        }
    }
    else {
        wnpAnywhere();
    }
    
    function postError(e) {
             if (window.opera  ) opera.postError(e);
        else if (window.console) console.error(formatError(e));
    }
    function formatError(e) {
        if (e.name != null && e.message != null) {
            return '[Error:\nname: ' + e.name + '\nmessage: ' + e.message + '\n]';
        }
        return e;
    }
    function checkWNPInstalled() {
        return typeof WNP != 'undefined' || !!postError("wnp not installed.");
    }
    function getAbsolutePosition(el) {
        var p = el.offsetParent, x = el.offsetLeft, y = el.offsetTop;
        while (p) {
            x += p.offsetLeft; y += p.offsetTop;
            if (!browser.webkit) {  x -= p.scrollLeft; y -= p.scrollTop; }
            p = p.offsetParent;
        }
        return { x : x, y : y }
    }
    function addStyle(styleStr, doc) {
        var document = doc || window.document;
        var style = document.createElement('style');
        style.type = 'text/css';
        style.style.display = 'none';
        style.textContent = styleStr;
        document.body.appendChild(style);
        return style;
    }
    function getStyle(element, property, pseudo) {
        return (
            element.currentStyle
            ||
            element.ownerDocument.defaultView.getComputedStyle(element, pseudo || '')
        )[property];
    }
    function uescape(s) {
        return escape(s).replace(/%([0-9A-F]{2})/g, '\\u00$1').replace(/%u/g, '\\u');
    }
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
    }
    function findVideoTitle(a) {
        var title = '';
        if (!/<script/i.test(a.innerHTML)) {
            var title = (a.textContent/*@ || a.innerText || '' @*/).replace(/^\s+|\s+$/g, '');
            if (!title) {
                var img = a.getElementsByTagName('img')[0];
                if (img) title = (img.alt || '').replace(/^\s+|\s+$/g, '');
            }
        }
        if (!title) {
            var videoid = a.href.replace(/.*?watch\/(\w+).*/, '$1');
            var an = a.ownerDocument.querySelectorAll ? a.ownerDocument.querySelectorAll('a[href]') : a.ownerDocument.getElementsByTagName('a');
            var regHref = new RegExp('watch/' + videoid + '(?:[?#]|$)');
            for (var i = 0, len = an.length; i < len; i++) {
                var aa = an[i];
                if (regHref.test(aa.getAttribute('href')) && !/<script|<img/i.test(aa.innerHTML)) {
                    title =  (aa.textContent/*@ || aa.innerText || '' @*/).replace(/^\s+|\s+$/g, '');
                    if (title) break;
                }
            }
        }
        return title;
    }
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
                if (img && /\/_\.gif$/.test(img.src)) continue; // lazyimage.
                if (img) {
                    title[videoid] = title[videoid] || img.alt;
                    image[videoid] = image[videoid] || img.src;
                }
                if (!title[videoid]) {
                    var desc = a.textContent/*@ || a.innerText || '' @*/;
                    if (!/^\s*http/.test(desc)) {
                        title[videoid] = desc;
                    }
                }
            }
        }
        return { items: items, video: video, title: title, image: image }
    }
    function serializeRequest(command, playlist) {
        var obj = {
            command: command,
            playlist: playlist
        };
        return toJSON(obj);
    }
    //=== main routine on gateway page. ===//
    function prepareAnywhere() {
        if (!checkWNPInstalled()) return;
        var org_acceptDomain = WNP.acceptDomain;
        WNP.acceptDomain = function(url) {
            if (org_acceptDomain.call(WNP, url)) return true;
            if (WNP_ACCEPT_URL_LIST.some(function(item) {
                if (item.test) return item.test(url);
                return String(item).indexOf(url) == 0;
            })) return true;
            
            // TODO: judge by localStorage data.
            
            return false;
        };
    }
    
    //=== main routine on any page. ===//
    function wnpAnywhere() {
        
        document.addEventListener('mouseover', function(e) {
            showToolTipIfNecessary(e.target);
        }, false);
        
        var gateway = document.createElement('iframe');
        gateway.src = WNP_GATEWAY_URL;
        gateway.setAttribute('width', '1');
        gateway.setAttribute('height', '1');
        gateway.setAttribute('style', 'position: absolute; top: 0; right: 0; display: none;');
        document.body.appendChild(gateway);
        
        var WNP = {};
        WNP.open = function(playlist) {
            gateway.contentWindow.postMessage(serializeRequest('open', playlist), WNP_GATEWAY_URL);
        };
        WNP.play = function(playlist) {
            if (!playlist) playlist = createPlayInfo(document.getElementsByTagName('body')[0]);
            gateway.contentWindow.postMessage(serializeRequest('play', playlist), WNP_GATEWAY_URL);
        };
        WNP.add = function(playlist) {
            if (!playlist) playlist = createPlayInfo(document.getElementsByTagName('body')[0]);
            gateway.contentWindow.postMessage(serializeRequest('add', playlist), WNP_GATEWAY_URL);
        };
        WNP.insert = function(playlist) {
            if (!playlist) playlist = createPlayInfo(document.getElementsByTagName('body')[0]);
            gateway.contentWindow.postMessage(serializeRequest('insert', playlist), WNP_GATEWAY_URL);
        };

        var tooltipStyle = [
            '.wnp_tooltip {',
            '    width: 168px;',
            '    opacity: 0.4; ',
            '    position: absolute; ',
            '    z-index: 999; ',
            '}',
            '.wnp_tooltip:hover {',
            '    opacity: 1; ',
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
            '    text-decoration: none;',
            '    color: #F0F0F0;',
            '    border-style: solid;',
            '    border-width: 15px 0;',
            '    border-top-color: #555;',
            '    border-bottom-color: #000;',
            '    padding: 0;',
            '    float: left;',
            '    margin-right: 2px;',
            '}',
            '.wnp_tooltip * span {',
            '    box-sizing: border-box;',
            '    border: 1px solid #DDD;',
            '    display: inline-block;',
            '    width: 50px;',
            '    height: 24px;',
            '    text-align: center;',
            '    position: absolute;',
            '    top: 0px;',
            '    margin-top: 3px;',
            '    margin-left: 2px;',
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
        
        var tooltip = null;
        var tid = null;
        var pls = null;
        function showToolTipIfNecessary(target) {
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
                addStyle(tooltipStyle);
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
                window.addEventListener('mouseup', function(e) { tooltip.style.display = 'none'; }, false);
                window.addEventListener(browser.mozilla ? 'DOMMouseScroll' : 'mousewheel', function(e) {
                    tooltip.style.display = 'none';
                }, false);
                var an = tooltip.getElementsByTagName('a');
                an[0].addEventListener('click', function(e) { e.preventDefault(); if (pls) WNP.play(pls); }, false);
                an[1].addEventListener('click', function(e) { e.preventDefault(); if (pls) WNP.add(pls); }, false);
                an[2].addEventListener('click', function(e) { e.preventDefault(); if (pls) WNP.insert(pls); }, false);
                document.getElementsByTagName('body')[0].appendChild(tooltip);
            }
            else {
                // refresh.
                for (var i = 0, len = tooltip.childNodes.length; i < len; i++) {
                    var node = tooltip.childNodes[i];
                    if (node.innerHTML) node.innerHTML = node.innerHTML;
                }
            }

            var title = findVideoTitle(a);
            if (pls.title && !pls.title[pls.items[0]]) {
                pls.title[pls.items[0]] = title;
            }
            var open_href = 'javascript:' + encodeURIComponent('void((window.WNP)?WNP.open(' + toJSON(pls) + '):location.href="' + a.href +'")');
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
            }, 2200);
        }
    }
})();
