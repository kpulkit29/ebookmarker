function shouldRun(url) {
    return /^[https|http]/gi.test(url)
}

chrome.tabs.onActivated.addListener((tab) => {
    chrome.tabs.get(tab.tabId, currTab => {
        if(shouldRun(currTab.url)) {
            chrome.tabs.executeScript(
                null,
                {file:'./foreground.js'}
            )
        }
        chrome.storage.local.remove("positions");
    })


})

chrome.tabs.onUpdated.addListener((tab, change, tabInfo) => {
   if(change.status == "complete" && tabInfo.active && shouldRun(tabInfo.url)) {
        chrome.tabs.executeScript(
            null,
            {file:'./foreground.js'}
        )
   }
})