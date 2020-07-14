// To display any new positions
chrome.storage.local.get('positions', val => {
    val = val.positions;
    if(val){
        let arr = val.split(":");
        let [x,y,text] = arr;
        let newSelection = document.createElement("button");
        newSelection.setAttribute("data-x",x);
        newSelection.setAttribute("data-y",y);
        newSelection.setAttribute("data-txt",text);
        newSelection.setAttribute("no-sc","1");
        newSelection.classList.add("add");
        newSelection.innerText = "Add this as a bookmark";
        document.getElementById("selections").innerHTML += `<b class="curr-selection">${text}</b>`;
        document.getElementById("selections").appendChild(newSelection);
    }
    
  });

  /**
   * 
   * @param {MouseEvent} e 
   */
function addNewBookmark(e) {
    let x = e.target.getAttribute('data-x');
    let y = e.target.getAttribute('data-y');
    let highlight = e.target.getAttribute('data-txt');
    chrome.storage.local.get("savedCoords", val => {
        if(!val.savedCoords) {
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                var activeTab = tabs[0];
                var obj = {
                    [activeTab.url]: [`${x}:${y}:${highlight}`]
                }
                chrome.storage.local.set({"savedCoords":JSON.stringify(obj)}, loadCard);
            });
        } else {
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                var activeTab = tabs[0];
                const parsedSavedCoords = val.savedCoords && JSON.parse(val.savedCoords);
                if(parsedSavedCoords[activeTab.url]) {
                    parsedSavedCoords[activeTab.url].push(`${x}:${y}:${highlight}`)
                    chrome.storage.local.set({"savedCoords": JSON.stringify(parsedSavedCoords)}, loadCard);
                } else {
                    var obj = {
                        ...parsedSavedCoords,
                        [activeTab.url]: [`${x}:${y}:${highlight}`]
                    }
                    chrome.storage.local.set({"savedCoords": JSON.stringify(obj)}, loadCard);
                }
            });
        }
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {"message": "bookmarkAdded"});
        });
        resetScreen();
    })
}

function resetScreen() {
    document.getElementById("selections").innerHTML = "";
    document.getElementById("selections").innerText = "";
    document.getElementById("bookmarks").innerHTML = "";
}

/**
 * 
 * @param {string} x docX
 * @param {string} y docY
 * @param {string} text  
 * Utility function to created bookmark card containing text
 */
function createBookmarkCard(x, y, text) {
    let card = document.createElement("div");
    card.classList.add("book-card");
    card.innerHTML += '<i  class="fa fa-bookmark" aria-hidden="true"></i>' + '<p>' + text + '</p>';
    card.appendChild(createButton(x,y));
    return card;
}

document.onclick = function(e) {
    let x = e.target.getAttribute('data-x');
    let y = e.target.getAttribute('data-y');
    let noscroll = e.target.getAttribute("no-sc");
    
    if(e.target.nodeName != "BUTTON") {
        return;
    }

    if(!y || noscroll == "1") {
        addNewBookmark(e);
        return;
    }
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "scroll", coord: {x,y}});
    });
}

/**
 * 
 * @param {string} x DOCX
 * @param {string} y DOCY
 */
function createButton(x, y) {
    let newSelection = document.createElement("button");
    newSelection.setAttribute("data-x",x);
    newSelection.setAttribute("data-y",y);
    newSelection.innerText = "Go here";
    return newSelection;
} 

/**
 * Loads user's stored bookmarks for current url
 */
function loadCard() {
    chrome.storage.local.get("savedCoords", val => {
        const parsedSavedCoords = val.savedCoords && JSON.parse(val.savedCoords);
        console.log(parsedSavedCoords);
        if(parsedSavedCoords) {
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                var activeTab = tabs[0];
                const bookmarks = parsedSavedCoords[activeTab.url];
                if(!bookmarks){
                    return;
                }

                const allBookmarks = document.getElementById("bookmarks");
                for(let item of bookmarks) {
                    let [x,y,text] = item.split(":");
                    allBookmarks.appendChild(createBookmarkCard(x, y, text))
                }

            });
        }
    })
}

loadCard()




