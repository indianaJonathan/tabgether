var import_file = null;
var locale;

window.onload = async () => {
    // Get language from storage
    const result = await chrome.storage.local.get(["language", "collections"]);
    const selectedLang = result.language || "en-us";
    const collections = result.collections || [];

    // Get locale from file
    locale = await fetch(`../languages/${selectedLang}.json`)
        .then((response) => response.json());

    loadListeners(collections);
    applyLocation(collections);
    applyTheme();
    chrome.storage.onChanged.addListener(() => {
        loadListeners(collections);
        applyLocation(collections);
        applyTheme();
    });
}

function loadListeners(collections) {
    // Get page elements
    const fileInput = document.getElementById("import-file-input");
    const fileComponent = document.getElementById("import-file-component");
    const importButton = document.getElementById("import-button");

    // Load listeners
    fileComponent.addEventListener("click", () => {
        fileInput.click();
    });
    fileInput.addEventListener("change", () => {
        const selectFileCaption = document.getElementById("select-file");
        if (fileInput.files.length > 0) {
            file_uploaded = fileInput.files[0];
            if (file_uploaded.type == "application/json") {
                selectFileCaption.innerHTML = fileInput.files[0].name;
                fileComponent.style.background = "#A0E85C";
                fileComponent.style.border = "1px solid #25F400";
                import_file = fileInput.files[0];
                importButton.disabled = false;
                applyLocation(collections);
                applyTheme();
            } else {
                alert(locale.others.errors.incorret_type);
            }
        }
    });

    importButton.addEventListener("click", () => {
        console.log("clicou");
        var reader = new FileReader();
        reader.onload = (event) => {
            var newCollections = JSON.parse(event.target.result);
            for (const collection of newCollections) {
                const newCollection = {
                    id: crypto.randomUUID(),
                    name: collection.name,
                    urls: collection.urls.map((url) => {
                        return {
                            id: crypto.randomUUID(),
                            string: url.string,
                        }
                    }),
                    color: collection.color,
                };
                collections.push(newCollection);
            }
            chrome.storage.local.set({ "collections": collections });
            document.getElementById("import-file-input").value = "";
            const selectFileCaption = document.getElementById("select-file");
            selectFileCaption.innerHTML = locale.others.captions.select_file;
            const fileComponent = document.getElementById("import-file-component");
            fileComponent.style = null;
            fileComponent.classList.value = "input-file";
            import_file = null;
        };
        reader.readAsText(import_file);
    });
}

async function applyLocation(collections) {
    // Get page elements
    const pageTitle = document.getElementById("page-title");
    const backButton = document.getElementById("back");
    const selectFileInput = document.getElementById("select-file");
    const importButton = document.getElementById("import-button");
    const element = document.getElementById("collections-size");
    const fileInput = document.getElementById("import-file-input");

    const shouldDisable = fileInput.files.length === 0;

    // Apply locale on elements
    pageTitle.innerHTML = locale.titles.import_collections;
    backButton.title = locale.buttons.titles.back;
    selectFileInput.innerHTML = locale.others.captions.select_file;
    importButton.innerHTML = locale.buttons.captions.import;
    importButton.title = shouldDisable ? locale.others.errors.no_file : locale.others.titles.import_from_file;
    if (collections && collections.length > 0) {
        element.innerHTML = `${locale.others.captions.current_collections} ${collections.length}`
    } else {
        element.innerHTML += `${locale.others.captions.current_collections} 0`
    }
}

async function applyTheme() {
    // Get theme from storage
    const result = chrome.storage.local.get(["theme"]);
    const theme = result.theme || "dark";

    // Get page elements
    const pageMain = document.getElementById("import-page");
    const container = document.getElementById("container");
    const backIcon = document.getElementById("back-icon");
    const importButton = document.getElementById("import-button");
    const icons = [backIcon]

    const shouldDisable = import_file ? false : true;

    // Apply theme on elements
    pageMain.classList.value = `full-page-${theme}`
    container.classList.value = `container-${theme}`
    importButton.classList.value = shouldDisable ? `import-button-disabled` : `import-button`;
    for (const icon of icons) {
        icon.classList.value = `icon-${theme}`
    }
}