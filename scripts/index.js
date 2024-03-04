var theme = "";
var lang;

window.onload = async () => {
    // Get language from storage
    const result = await chrome.storage.local.get(["language", "collections"]);
    const selectedLang = result.language || "en-us";
    const collections = result.collections || [];

    // Get locale from file
    locale = await fetch(`../languages/${selectedLang}.json`)
        .then((response) => response.json());

    await loadData();
    loadListeners(collections);
    applyLocation(collections);
    applyTheme(collections);
    chrome.storage.onChanged.addListener(() => {
        loadData();
        applyLocation();
        applyTheme();
    });
}

function applyLocation(collections) {
    // Get page elements
    const pageTitle = document.getElementById("page-title");
    const settingsButton = document.getElementById("settings-button");
    const importButton = document.getElementById("import-button");
    const exportButton = document.getElementById("export-button");

    // Apply locale to elements
    pageTitle.innerHTML = locale.titles.your_collections;
    settingsButton.title = locale.buttons.titles.settings;
    importButton.title = locale.buttons.titles.import;
    exportButton.title = locale.buttons.titles.export;

    // Apply locale to collections components
    for (const collection of collections) {
        const collectionElement = document.getElementById(`tab-collection-${collection.id}`);
        collectionElement.title = `${locale.others.titles.open_collection}`;
    }
}

async function applyTheme(collections) {
    // Get theme from storage
    const result = await chrome.storage.local.get(["theme"]);
    const theme = result.theme || "dark";

    // Get page elements
    const pageMain = document.getElementById("index-page");
    const container = document.getElementById("container");
    const importIcon = document.getElementById("import-icon");
    const exportIcon = document.getElementById("export-icon");
    const settingsIcon = document.getElementById("settings-icon");
    const icons = [importIcon, exportIcon, settingsIcon];

    // Apply theme to elements
    pageMain.classList.value = `full-page-${theme}`;
    container.classList.value = `container-${theme}`;
    for (const icon of icons) {
        icon.classList.value = `icon-${theme}`;
    }

    // Apply theme on collections elements
    for (const collection of collections) {
        const tabElement = document.getElementById(`tab-collection-${collection.id}`);
        tabElement.classList.value = `border-${theme}`;
        const collectionDetails = document.getElementById(`collection-details-${collection.id}`);
        collectionDetails.classList.value = `collection-details-${theme}`;
    }
}

async function loadData() {
    // Get collections from storage
    const result = await chrome.storage.local.get(["collections"]);
    const collections = result.collections || [];

    // Get page elements
    const container = document.getElementById("container");

    if (collections.length > 0) {
        container.innerHTML = collections.map((collection) => {
            return CollectionComponent(collection);
        }).join("");
    }
}

function loadListeners(collections) {
    for (const collection of collections) {
        if (collection) {
            const collectionElement = document.getElementById(`tab-collection-${collection.id}`);
            collectionElement.addEventListener("click", async () => {
                if (collection.urls.length > 0) {
                    const current_tab = await chrome.tabs.query({ currentWindow: true, active: true });
                    for (const url of collection.urls) {
                        chrome.tabs.create({ url: url.string, active: collection.urls.indexOf(url) == 0 });
                    }
                    if (current_tab[0].url == "chrome://newtab/" || !current_tab[0].url) {
                        chrome.tabs.remove(current_tab[0].id);
                    }
                } else {
                    alert(locale.others.errors.no_tabs);
                }
            });
        }
    }
}

function maxString(value, type) {
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

function CollectionComponent(collection) {
    return `
        <div id="tab-collection-${collection.id}">
            <div class="tabs-collection">
                <div class="collection-info">
                    <div class="collection-id" style="background-color: ${collection.color};"></div>
                    <span class="collection-name">${maxString(collection.name, "title")}</span>
                </div>
                <div id="collection-details-${collection.id}">
                    <span>${collection?.urls?.length}</span>
                </div>
            </div>
        </div>
    `;
}