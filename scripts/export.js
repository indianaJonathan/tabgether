const collections_to_export = [];

window.onload = () => {
    getCollections();
    chrome.storage.onChanged.addListener(() => {
        getCollections();
    });
}

function getCollections () {
    chrome.storage.local.get(["collections"]).then((result) => {
        container = document.getElementById("container");
        container.innerHTML = `<span>No collections found</span>`;
        if (result.collections && result.collections.length > 0) {
            container.innerHTML = `
                <form id="export-collections-form" class="export-form">
                </form>
            `;
            getCollectionsElements(result.collections);
            form = document.getElementById("export-collections-form")
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                downloadObjectAsJson(collections_to_export, "tab_collections")
            });
        }
    });
}

function getCollectionsElements (collections) {
    exportForm = document.getElementById("export-collections-form");
    output = "";
    for (let collection of collections) {
        output += `
            <div class="border" id="collection-select-${collection.id}" title="Select ${collection.name} collection">
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
    setActions(collections);
}

function setActions (collections) {
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
                collectionDiv.style.backgroundColor = "#303030";
                collectionDiv.title = `Deselect ${collection.name} collection`;
                collections_to_export.push(collection);
                collections_to_export.sort(function (a, b) { return a.id - b.id });
            } else {
                collectionDiv.style.backgroundColor = null;
                collectionDiv.title = `Select ${collection.name} collection`;
                collections_to_export.splice(collections_to_export.indexOf(collection), 1);
            }
        });
    }
}

function getFormButtons() {
    buttons = document.getElementById("form-buttons");
    buttons.innerHTML = collections_to_export.length > 0 ? `
            <button id="export-collections-button" class="export-button" type="submit">
                Export
            </button>
        `
    :
        `
            <button id="export-collections-button-disabled" class="export-button-disabled" type="submit" title="Cannot export without select any collection" disabled>
                Export
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