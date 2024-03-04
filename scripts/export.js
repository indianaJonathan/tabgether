const collections_to_export = [];
let locale;
let collections = [];

window.onload = async () => {
    // Get language from storage
    const result = await chrome.storage.local.get(["language", "collections"]);
    const selectedLang = result.language || "en-us";
    // Get locale from file
    locale = await fetch(`../languages/${selectedLang}.json`)
        .then((response) => response.json());

    const collections = result.collections || [];

    await loadData();
    loadListeners(collections);
    applyLocation(collections);
    applyTheme(collections);
    chrome.storage.onChanged.addListener(() => {
        loadData();
        loadListeners(collections);
        applyLocation(collections);
        applyTheme(collections);
    });
}

async function applyLocation(collections) {
    // Get page elements
    const pageTitle = document.getElementById("page-title");
    const exportButton = document.getElementById("export-collections-button");

    // Apply locale to elements
    pageTitle.innerHTML = locale.titles.export_collections;
    exportButton.innerHTML = locale.buttons.captions.export;
    if (exportButton) {
        const shouldDisable = collections_to_export.length === 0;
        exportButton.disabled = shouldDisable;
        exportButton.title = shouldDisable ? locale.others.errors.no_collection_selected : "";
        exportButton.innerHTML = locale.buttons.captions.export;
    }

    // Apply locale to collections elements
    for (const collection of collections) {
        const collectionComponent = document.getElementById(`collection-select-${collection.id}`);
        const isSelected = collections_to_export.includes(collection);
        if (collectionComponent) collectionComponent.title = !isSelected ? locale.others.captions.select_collection : locale.others.captions.deselect_collection;
    }
}

async function applyTheme(collections) {
    // Get theme from storage
    const result = await chrome.storage.local.get(["theme"]);
    const theme = result.theme || "dark";

    // Get elements from page
    const pageMain = document.getElementById("export-page");
    const container = document.getElementById("container");
    const exportButton = document.getElementById("export-collections-button");
    const backIcon = document.getElementById("back-icon");
    const icons = [backIcon];

    const shouldDisable = collections_to_export.length === 0;

    // Appy theme on elements
    pageMain.classList.value = `full-page-${theme}`;
    container.classList.value = `container-${theme}`;
    exportButton.classList.value = shouldDisable ? "export-button-disabled" : "export-button";

    for (const icon of icons) {
        icon.classList.value = `icon-${result.theme}`
    }

    // Apply theme for collections components
    for (const collection of collections) {
        const collectionComponent = document.getElementById(`collection-select-${collection.id}`);
        const isSelected = collections_to_export.includes(collection);
        if (collectionComponent) collectionComponent.classList.value = `border-${theme}`;
        if (isSelected) collectionComponent.classList.value += ` selected-${theme}`;
    }
}

async function loadData() {
    // Get data from storage
    const result = await chrome.storage.local.get(["collections"]);
    const collections = result.collections || [];

    // Insert data into page container
    const container = document.getElementById("container");
    if (collections.length > 0) {
        container.innerHTML = `
            <form id="export-collections-form" class="export-form">
                ${collections.map((collection) => {
            return CollectionComponent(collection);
        }).join("")}
                <div class="form-buttons" id="form-buttons">
                    <button id="export-collections-button" type="submit"></button>
                </div>
            </form>
        `;
    } else {
        container.innerHTML = `<span>No collections found</span>`;
    }
}

function loadListeners(collections) {
    const form = document.getElementById("export-collections-form");
    if (form) form.addEventListener("submit", (event) => {
        event.preventDefault();
        downloadObjectAsJson(collections_to_export, "tab_collections")
    });

    for (let collection of collections) {
        const element = document.getElementById(`collection-select-${collection.id}`);
        const checkbox = document.getElementById(`checkbox-${collection.id}`);
        element.addEventListener("click", () => {
            checkbox.click();
            applyTheme(collections);
            applyLocation(collections);
        });
        checkbox.addEventListener("click", () => {
            const collectionDiv = document.getElementById(`collection-select-${collection.id}`);
            if (checkbox.checked) {
                collectionDiv.title = `${locale.others.captions.deselect_collection}`;
                collections_to_export.push(collection);
                collections_to_export.sort(function (a, b) { return a.id - b.id });
            } else {
                collectionDiv.title = `${locale.others.captions.select_collection}`;
                collections_to_export.splice(collections_to_export.indexOf(collection), 1);
            }
        });
    }
}

function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function CollectionComponent(collection) {
    return `
        <div id="collection-select-${collection.id}">
            <div class="tabs-collection" id="collection-export-${collection.id}">
                <input type="checkbox" id="checkbox-${collection.id}" name="checkbox-${collection.id}" hidden/>
                <span class="collection-name">${collection.name}</span>
            </div>
        </div>
    `
}