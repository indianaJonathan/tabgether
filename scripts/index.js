window.onload = () => {
    getCollections();
    chrome.storage.onChanged.addListener(() => {
        getCollections();
    });
}

function getCollections () {
    chrome.storage.local.get(["collections"]).then((result) => {
        let output = `<span>No collections found</span>`;
        if (result.collections && result.collections.length > 0) {
            output = "";
            for (let item of result.collections) {
                output += `
                    <div class="border" id="tab-collection-${item.id}">
                        <div class="tabs-collection" title="Open ${item.name.toLowerCase()} collection">
                            <div class="collection-info">
                                <div class="collection-id" style="background-color: ${item.color};">${item.id}</div>
                                <span class="collection-name">${maxString(item.name, "title")}</span>
                            </div>
                            <div class="collection-details">
                                <span>${item.urls.length}</span>
                            </div>
                        </div>
                    </div>
                `;
            } 
        }
        document.querySelector(".container").innerHTML = output;
        if (result.collections && result.collections.length > 0) {
            for (let item of result.collections) {
                document.getElementById(`tab-collection-${item.id}`).addEventListener("click", async (event) => {
                    if (item.urls.length > 0) {
                        const current_tab = await chrome.tabs.query({ currentWindow: true, active: true });
                        for (let url of item.urls) {
                            chrome.tabs.create({ url: url.string, active: item.urls.indexOf(url) == 0 });
                        }
                        if (current_tab[0].url == "chrome://newtab/") {
                            chrome.tabs.remove(current_tab[0].id);
                        }
                    } else {
                        alert("No tabs to open. Add tabs to this collection in the app settings");
                    }
                });
            }
        }
    });
}

function maxString (value, type) {
    switch (type) {
        case "url":
            if (value.length > 38) return value.substring(0, 35) + "...";
            return value;
        case "title":
            if (value.length > 17) return value.substring(0, 14) + "...";
            return value;
        default:
            return value;
    }
}