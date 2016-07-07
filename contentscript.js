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

function removeWatchedVideos(parentLevel) {
    var watchedlist = document.getElementsByClassName("watched");

    if(watchedlist.length > 0) debug("Found "+watchedlist.length+" watched videos, hiding them.");

    // iterate in reverse order to avoid race condition...
    for(var ei = watchedlist.length - 1; ei >= 0; ei--) {
	var e = watchedlist[ei];
	var pe = getNthParentElement(e, parentLevel);
	if(pe) pe.parentNode.removeChild(pe);
    }
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

var pageParentLevel = -1;
var currentLocation = "";
setInterval(function() { 
    if(window.location.href != currentLocation) {
	currentLocation = window.location.href;
	pageParentLevel = getParentLevelFromPage(currentLocation);
    }
    removeWatchedVideos(pageParentLevel); 
}, 500);

