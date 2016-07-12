function debug() {
    var args = [...arguments];
    var msg = "[YouTube-hide] " + args[0];
    if(args.length > 1) {
        var rest = args.slice(1);
	console.log.apply(console, [msg].concat(rest));
    } else {
        console.log(msg);
    }
}

function getNthParentElement(e, n) {
    if(n < 0) return null;
    if(n == 0) return e;
    if(!e || !("parentElement" in e)) return null;

    return getNthParentElement(e.parentElement, n-1);
}

var hiddenElements = new Map();
var hideOrShowWatchedVideos = showWatchedVideos;

var hideCSS = {
	//"border": "1px solid red",
	"display": "none"
}

function hideElement(e) {
	if(e && !hiddenElements.has(e)) {
		var val = {};
		for(var csskey in hideCSS) {
		    // remember old CSS
		    val[csskey] = e.style[csskey];
		    // set new CSS
		    e.style[csskey] = hideCSS[csskey];
		}
	        hiddenElements.set(e, val);

		//e.parentNode.removeChild(pe);

		return true;
	}
	return false;
}

function hideWatchedVideos(parentLevel) {
    var watchedlist = document.getElementsByClassName("watched");

    var counter = 0;
    // iterate in reverse order to avoid race condition...
    for(var ei = watchedlist.length - 1; ei >= 0; ei--) {
	var e = watchedlist[ei];
	var pe = getNthParentElement(e, parentLevel);
	if(hideElement(pe)) {
  	    counter++;
	}
    }
    if(counter > 0) debug("Found "+counter+" extra watched videos and hid them.");
}

function showWatchedVideos() {
    var counter = 0;
    hiddenElements.forEach(function(val, key) {
	for(var csskey in hideCSS) {
	    // restore CSS
	    key.style[csskey] = val[csskey];
	}
	counter++;
    });
    hiddenElements = new Map();
    if(counter > 0) debug("Restored "+counter+" hidden videos.");
}

function showParentsOfFirstWatched() {
    var watchedlist = document.getElementsByClassName("watched");

    if(watchedlist.length > 0) debug("Found "+watchedlist.length+" watched videos");

    var e = watchedlist[0];
    for(var i = 0; i < 15; i++) {
	debug("Parent "+i, getNthParentElement(e, i));
    }
}

function getParentLevelFromPage(loc) {
    var relist = [
        {re: new RegExp("https://www.youtube.com/user/[^/]+/videos\?.*flow=list.*"), level: 8}, // grid
        {re: new RegExp("https://www.youtube.com/user/[^/]+/videos.*"), level: 5},
        {re: new RegExp("https://www.youtube.com/user/[^/]+/featured.*"), level: 5},
        {re: new RegExp("https://www.youtube.com/channel/.*"), level: 5},
        {re: new RegExp("https://www.youtube.com/playlist.*"), level: 3},
        {re: new RegExp("https://www.youtube.com/feed/subscriptions\?.*flow=1.*"), level: 3}, // grid
        {re: new RegExp("https://www.youtube.com/feed/subscriptions.*"), level: 11},
    ];

    debug("Current location: "+loc);
    for(var rei = 0; rei < relist.length; rei++) {
        re = relist[rei];
        if(loc.match(re["re"])) {
	    debug("Current regex["+rei+"]: ", re);
	    return re["level"];
	}
    }
    debug("No regex found :(");
    //showParentsOfFirstWatched(); // show parent elements for debugging
    return -1;
}

function switchWatchVideosFunction(v) {
	if(v) {
		hideOrShowWatchedVideos = hideWatchedVideos;
	} else {
		hideOrShowWatchedVideos = showWatchedVideos;
	}
}

var pageParentLevel = -1;
var currentLocation = "";
setInterval(function() { 
    if(window.location.href != currentLocation) {
	currentLocation = window.location.href;
	pageParentLevel = getParentLevelFromPage(currentLocation);
    }
    hideOrShowWatchedVideos(pageParentLevel); 
}, 300);

chrome.storage.onChanged.addListener(function(data) { switchWatchVideosFunction(data["state"]["newValue"]["active"]); });
chrome.storage.local.get({'state': {"active": "true"}}, function(result) { switchWatchVideosFunction(result["state"]["active"]); });

