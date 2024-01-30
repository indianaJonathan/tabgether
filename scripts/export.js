const collections_to_export = [];
let lang;

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
    chrome.storage.local.get(["collections", "theme"]).then((result) => {
        pageMain = document.getElementById("export-page");
        pageMain.classList.value = `full-page-${result.theme}`
        pageTitle = document.getElementById("page-title");
        pageTitle.innerHTML = lang.titles.export_collections;
        container = document.getElementById("container")
        container.classList.value = `container-${result.theme}`
        back_icon = document.getElementById("back-icon")
        icons = [back_icon]
        for (icon of icons) {
            icon.classList.value = `icon-${result.theme}`
        }
        container.innerHTML = `<span>No collections found</span>`;
        if (result.collections && result.collections.length > 0) {
            container.innerHTML = `
                <form id="export-collections-form" class="export-form">
                </form>
            `;
            getCollectionsElements(result.collections, result.theme);
            form = document.getElementById("export-collections-form")
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                downloadObjectAsJson(collections_to_export, "tab_collections")
            });
        }
    });
}

function getCollectionsElements (collections, theme) {
    exportForm = document.getElementById("export-collections-form");
    output = "";
    for (let collection of collections) {
        output += `
            <div class="border-${theme}" id="collection-select-${collection.id}" title="${lang.others.captions.select_collection}">
                <div class="tabs-collection" id="collection-export-${collection.id}">
                    <input type="checkbox" id="checkbox-${collection.id}" name="checkbox-${collection.id}" hidden/>
                    <span class="collection-name">${collection.name}</span>
                </div>
            </div>
        `
    }
    output += `<div class="form-buttons" id="form-buttons"></div>`
    exportForm.innerHTML = output;
    getFormButtons();
    setActions(collections, theme);
}

function setActions (collections, theme) {
    for (let collection of collections) {
        element = document.getElementById(`collection-select-${collection.id}`);
        element.addEventListener("click", (event) => {
            checkbox = document.getElementById(`checkbox-${collection.id}`);
            checkbox.click();
            getFormButtons();
        });
        checkbox = document.getElementById(`checkbox-${collection.id}`);
        checkbox.addEventListener("click", (event) => {
            collectionDiv = document.getElementById(`collection-select-${collection.id}`);
            if (checkbox.checked) {
                collectionDiv.classList.value = `border-${theme} selected-${theme}`;
                collectionDiv.title = `${lang.others.captions.deselect_collection}`;
                collections_to_export.push(collection);
                collections_to_export.sort(function (a, b) { return a.id - b.id });
            } else {
                collectionDiv.classList.value = `border-${theme}`;
                collectionDiv.title = `${lang.others.captions.select_collection}`;
                collections_to_export.splice(collections_to_export.indexOf(collection), 1);
            }
        });
    }
}

function getFormButtons() {
    buttons = document.getElementById("form-buttons");
    buttons.innerHTML = collections_to_export.length > 0 ? `
            <button id="export-collections-button" class="export-button" type="submit">
                ${lang.buttons.captions.export}
            </button>
        `
    :
        `
            <button id="export-collections-button-disabled" class="export-button-disabled" type="submit" title="${lang.others.errors.no_collection_selected}" disabled>
                ${lang.buttons.captions.export}
            </button>
        `
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}