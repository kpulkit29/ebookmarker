function debounce(cb, timer) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        let context = this;
        args = arguments;
        timeout = setTimeout(function(){
            cb.apply(context, args);
        }, timer)
    }
}

function setToStorage(x, y ,highlight) {
    if(highlight.length) {
        chrome.storage.local.set({"positions": `${x}:${y}:${highlight}`});
    }
}

/**
 * Execute messages sent by popup
 */
chrome.runtime.onMessage.addListener(
    function(request) {
        if( request.message === "scroll" ) {
            window.scrollTo(parseInt(request.coord.x), parseInt(request.coord.y))
        }

        else if( request.message === "bookmarkAdded" ) {
            chrome.storage.local.remove("positions");
        }
    }
);

/**
 * It stores the coordinates of lastest user selection (utilizes mouseup)
 * Will not change until user selection is changed
 */
document.onmouseup = debounce(function(e) {
    if(window.userPrevSelection == window.getSelection().toString()) {
        return;
    }
    window.prevCord = {
        x: e.pageX,
        y: e.pageY
    }
    
    let highlight = window.getSelection().toString();
    window.userPrevSelection = highlight;
    setToStorage(prevCord.x, prevCord.y, highlight);
}, 100)
