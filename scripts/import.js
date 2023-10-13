var import_file = null;

window.onload = () => {
    getCollections();
    chrome.storage.onChanged.addListener(() => {
        getCollections();
    });
    fileInput = document.getElementById("import-file-input");
    fileComponent = document.getElementById("import-file-component");
    fileComponent.addEventListener("click", (event) => {
        fileInput.click();
    });
    fileInput.addEventListener("change", (event) => {
        if (fileInput.files.length > 0) {
            file_uploaded = fileInput.files[0];
            if (file_uploaded.type == "application/json") {
                fileComponent.innerHTML = `<span style="color: black">${fileInput.files[0].name}</span>`;
                fileComponent.style.background = "#A0E85C";
                fileComponent.style.border = "1px solid #25F400";
                buttons = document.getElementById("import-buttons");
                buttons.title = "Import collections from file"
                buttons.innerHTML = `
                    <button type="button" class="import-button" id="import-button">Import</button>
                `
                import_file = fileInput.files[0];
            } else {
                alert('Incorrect file format');
                fileInput.value = '';
                buttons = document.getElementById("import-buttons");
                buttons.title = "Cannot import collections without a file"
                buttons.innerHTML = `
                    <button type="button" class="import-button-disabled" id="import-button-disabled" disabled>Import</button>
                `
            }
        }
        if (import_file) getActions();
    });
}

function getActions () {
    button = document.getElementById("import-button");
    if (button) {
        button.addEventListener("click", (event) => {
            chrome.storage.local.get(["collections"]).then((result) => {
                current_collections = result.collections && result.collections.length > 0 ? result.collections : [];
                var reader = new FileReader();
                reader.onload = (event) => {
                    var collections = JSON.parse(event.target.result);
                    const newCollections = [];
                    for (let collection of collections) {
                        const collectionId = current_collections.length > 0 ? current_collections[current_collections.length - 1].id + 1 : 1;
                        const newUrls = [];
                        for (let url of collection.urls) {
                            const newUrl = { 
                                "id": `${collectionId}-${collection.urls.indexOf(url)}`, 
                                "string": url.string.startsWith("http") ? url.string : `https://${url.string}` 
                            }
                            newUrls.push(newUrl);
                        }
                        const newCollection = { 
                            "id": collectionId, 
                            "name": collection.name, 
                            "urls": newUrls,
                            "color": collection.color
                        };
                        newCollections.push(newCollection);
                    }
                    current_collections.push(...newCollections);
                    chrome.storage.local.set({ "collections": current_collections });
                    alert(`${collections.length} collection(s) imported`);
                    document.getElementById("import-file-input").value = "";
                };
                reader.readAsText(import_file);
            });
        });
    }
}

function getCollections () {
    chrome.storage.local.get(["collections", "theme"]).then((result) => {
        pageMain = document.getElementById("import-page");
        pageMain.classList.value = `full-page-${result.theme}`
        container = document.getElementById("container")
        container.classList.value = `container-${result.theme}`
        back_icon = document.getElementById("back-icon")
        icons = [back_icon]
        for (icon of icons) {
            icon.classList.value = `icon-${result.theme}`
        }
        element = document.getElementById("collections-size");
        if (result.collections && result.collections.length > 0) {
            element.innerHTML = `Current collections: ${result.collections.length}`
        } else {
            element.innerHTML += `Current collections: 0`
        }
    });
}