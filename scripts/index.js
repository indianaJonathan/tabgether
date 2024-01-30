var theme = "";
var lang;

window.onload = () => {
    getLocation();
    chrome.storage.onChanged.addListener(() => {
        getLocation();
    });
}

function getLocation() {
    chrome.storage.local.get(["language", "theme"]).then(async (result) => {
        selectedLang = "en-us";
        if (result.language) {
            selectedLang = result.language;
        } else {
            chrome.storage.local.set({"language": "en-us"});
        }
        lang = await fetch(`../languages/${selectedLang}.json`)
            .then((response) => response.json());
        getCollections();
    });
}

function getCollections () {
    chrome.storage.local.get(["collections", "theme", "language"]).then((result) => {
        pageMain = document.getElementById("index-page");
        listClasses = pageMain.classList;
        pageTitle = document.getElementById("page-title");
        pageTitle.innerHTML = lang.titles.your_collections;
        settingsButton = document.getElementById("settings-button");
        settingsButton.title = lang.buttons.titles.settings;
        importButton = document.getElementById("import-button");
        importButton.title = lang.buttons.titles.import;
        exportButton = document.getElementById("export-button");
        exportButton.title = lang.buttons.titles.export;
        import_icon = document.getElementById("import-icon");
        export_icon = document.getElementById("export-icon");
        settings_icon = document.getElementById("settings-icon");
        icons = [import_icon, export_icon, settings_icon];
        if (result.theme && result.theme == "dark") {
            pageMain.classList.value = "full-page-dark";
            for (icon of icons) {
                icon.classList.value = "icon-dark"
            }
        } else if (result.theme && result.theme == "light") {
            pageMain.classList.value = "full-page-light";
            for (icon of icons) {
                icon.classList.value = "icon-light"
            }
        } else {
            pageMain.classList.add("full-page-dark");
            for (icon of icons) {
                icon.classList.value = "icon-dark"
            }
            chrome.storage.local.set({ "theme": "dark" });
        }
        let output = `<span>${lang.others.span.no_collections_found}</span>`;
        if (result.collections && result.collections.length > 0) {
            output = "";
            for (let item of result.collections) {
                if (item) {
                    output += `
                        <div class="border-${result.theme}" id="tab-collection-${item.id}">
                            <div class="tabs-collection" title="${lang.others.titles.open_collection}">
                                <div class="collection-info">
                                    <div class="collection-id" style="background-color: ${item.color};"></div>
                                    <span class="collection-name">${maxString(item.name, "title")}</span>
                                </div>
                                <div class="collection-details-${result.theme}">
                                    <span>${item?.urls?.length}</span>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    const collections = result.collections;
                    const index = collections.indexOf(item);
                    collections.splice(index, 1);
                    chrome.storage.local.set({ "collections": collections });
                }
            } 
        }
        document.getElementById("container").innerHTML = output;
        document.getElementById("container").classList.value = `container-${result.theme}`
        if (result.collections && result.collections.length > 0) {
            for (let item of result.collections) {
                if (item) {
                    document.getElementById(`tab-collection-${item.id}`).addEventListener("click", async (event) => {
                        if (item.urls.length > 0) {
                            const current_tab = await chrome.tabs.query({ currentWindow: true, active: true });
                            for (let url of item.urls) {
                                chrome.tabs.create({ url: url.string, active: item.urls.indexOf(url) == 0 });
                            }
                            if (current_tab[0].url == "chrome://newtab/" || !current_tab[0].url) {
                                chrome.tabs.remove(current_tab[0].id);
                            }
                        } else {
                            alert(lang.others.errors.no_tabs);
                        }
                    });
                }
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
            if (value?.length > 17) return value?.substring(0, 14) + "...";
            return value;
        default:
            return value;
    }
}