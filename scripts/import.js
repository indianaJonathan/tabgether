var import_file = null;

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
        getListeners();
        getCollections();
    });
}

function getListeners () {
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
                buttons.title = lang.others.titles.import_from_file;
                buttons.innerHTML = `
                    <button type="button" class="import-button" id="import-button">${lang.buttons.captions.import}</button>
                `
                import_file = fileInput.files[0];
            } else {
                alert(lang.others.errors.incorret_type);
                fileInput.value = '';
                buttons = document.getElementById("import-buttons");
                buttons.title = "Cannot import collections without a file"
                buttons.innerHTML = `
                    <button type="button" class="import-button-disabled" id="import-button-disabled" disabled>${lang.buttons.captions.import}</button>
                `
            }
        }
        if (import_file) getActions();
    });
}

function getActions () {
    backButton = document.getElementById("back");
    backButton.title = lang.buttons.titles.back;
    button = document.getElementById("import-button");
    button.innerHTML = lang.buttons.captions.import;
    if (button) {
        button.addEventListener("click", (event) => {
            chrome.storage.local.get(["collections"]).then((result) => {
                const current_collections = result.collections && result.collections.length > 0 ? result.collections : [];
                var reader = new FileReader();
                reader.onload = (event) => {
                    var collections = JSON.parse(event.target.result);
                    const newCollections = [...current_collections];
                    for (let collection of collections) {
                        var available = false;
                        newId = 0
                        while (!available) {
                            const collec = newCollections.find((c) => c.id.toString() == newId.toString())
                            if (!collec) {
                                available = true;
                            } else {
                                newId += 1;
                            }
                        }
                        const newUrls = [];
                        for (let url of collection.urls) {
                            const newUrl = { 
                                "id": `${newId}-${collection.urls.indexOf(url)}`, 
                                "string": url.string.startsWith("http") ? url.string : `https://${url.string}` 
                            }
                            newUrls.push(newUrl);
                        }
                        const newCollection = { 
                            "id": newId, 
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
        pageTitle = document.getElementById("page-title");
        pageTitle.innerHTML = lang.titles.import_collections;
        container = document.getElementById("container");
        container.classList.value = `container-${result.theme}`
        back_icon = document.getElementById("back-icon");
        backButton = document.getElementById("back");
        backButton.title = lang.buttons.titles.back;
        selectFileInput = document.getElementById("select-file");
        selectFileInput.innerHTML = lang.others.captions.select_file;
        buttons = document.getElementById("import-buttons");
        buttons.innerHTML = `<button type="button" class="import-button-disabled" id="import-button-disabled" disabled>${lang.buttons.captions.import}</button>`
        icons = [back_icon]
        for (icon of icons) {
            icon.classList.value = `icon-${result.theme}`
        }
        element = document.getElementById("collections-size");
        if (result.collections && result.collections.length > 0) {
            element.innerHTML = `${lang.others.captions.current_collections} ${result.collections.length}`
        } else {
            element.innerHTML += `${lang.others.captions.current_collections} 0`
        }
    });
}