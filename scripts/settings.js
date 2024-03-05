let locale;

window.onload = async () => {
    const collections = await getLocale();

    await loadData(collections);
    loadListeners(collections);
    applyLocation(collections);
    applyTheme(collections);
    chrome.storage.onChanged.addListener(async () => {
        await getLocale();

        await loadData(collections);
        loadListeners(collections);
        applyLocation(collections);
        applyTheme(collections);
    });
}

async function getLocale() {
    // Get language from storage
    const result = await chrome.storage.local.get(["language", "collections"]);
    const selectedLang = result.language || "en-us";

    // Get locale from file
    locale = await fetch(`../languages/${selectedLang}.json`)
        .then((response) => response.json());

    return result.collections ?? [];
}

function applyLocation(collections) {
    // Get page elements
    const pageTitle = document.getElementById("page-title");
    const addButton = document.getElementById("add-new-collection-button");
    const backButton = document.getElementById("back");
    const noCollections = document.getElementById("no-collections");
    const modeButton = document.getElementById("dark_light_mode_button");

    // Apply locale on elements
    pageTitle.innerHTML = locale.titles.settings;
    addButton.title = locale.buttons.titles.add_collection;
    backButton.title = locale.buttons.titles.back;
    if (noCollections) noCollections.innerHTML = locale.others.span.no_collections_found;
    modeButton.title = getCurrentTheme() === "light" ? locale.buttons.titles.toggle_mode_light : locale.buttons.titles.toggle_mode_dark;

    // Apply locale on collections
    for (const collection of collections) {
        const optionsButton = document.getElementById(`collection-options-${collection.id}`);
        if (optionsButton) optionsButton.title = locale.buttons.titles.collection_options;

        const menuOptions = ["edit", "delete"];
        if (collections.indexOf(collection) !== 0) menuOptions.push("move-up");
        if (collections.indexOf(collection) !== collections.length - 1) menuOptions.push("move-down");

        for (const option of menuOptions) {
            const optionButton = document.getElementById(`collection-${option}-${collection.id}`);
            if (optionButton) optionButton.title = locale.buttons.titles[`${option}_collection`];
            const optionText = document.getElementById(`collection-${option}-text-${collection.id}`);
            if (optionText) optionText.innerHTML = locale.buttons.captions[`${option}`];
        }
    }
}

async function applyTheme(collections) {
    // Get theme from storage
    const theme = await getCurrentTheme();

    // Get page elements
    const container = document.getElementById("container");
    const pageMain = document.getElementById("settings-page");
    const langSelect = document.getElementById("language-select");
    const modeButton = document.getElementById("dark_light_mode_button");
    const backIcon = document.getElementById("back-icon");
    const icons = [backIcon];

    //Apply theme to elements
    container.classList.value = `container-${theme}`;
    pageMain.classList.value = `full-page-${theme}`;
    langSelect.classList.value = `input-select-${theme}`;
    modeButton.innerHTML = theme === "dark" ? DarkModeIcon() : LightModeIcon();
    for (const icon of icons) {
        icon.classList.value = `icon-${theme}`;
    }

    // Apply theme to collections
    for (const collection of collections) {
        const tabCollection = document.getElementById(`tab-collection-${collection.id}`);
        tabCollection.classList.value = `border-${theme}`;
        const optionsButton = document.getElementById(`options-button-${collection.id}`);
        optionsButton.classList.value = `icon-${theme}`;
        const menu = document.getElementById(`col-op-${collection.id}`);
        menu.classList.add(`float-menu-${theme}`);
    }
}

async function loadData(collections) {
    const result = await chrome.storage.local.get(["collections", "language"]);
    const selectedLang = result.language || "en-us";

    const container = document.getElementById("container");
    const langSelect = document.getElementById("language-select");

    langSelect.value = selectedLang;

    container.innerHTML =
        collections.length > 0 ?
            collections.map((collection) => {
                return CollectionComponent(collection, collections.indexOf(collection) === 0, collections.indexOf(collection) === collections.length - 1);
            }).join("")
            :
            `<span id="no-collections"></span>`
}

async function loadListeners(collections) {
    const langSelect = document.getElementById("language-select");
    const modeButton = document.getElementById("dark_light_mode_button");

    langSelect.addEventListener("change", async () => {
        await chrome.storage.local.set({ "language": langSelect.value });
    });

    if (modeButton) modeButton.addEventListener("click", async () => {
        switch (await getCurrentTheme()) {
            case "dark":
                await chrome.storage.local.set({ "theme": "light" });
                break;
            case "light":
                await chrome.storage.local.set({ "theme": "dark" });
                break;
            default:
                await chrome.storage.local.set({ "theme": "dark" });
                break;
        }
    });
    for (const collection of collections) {
        const deleteCollectionButton = document.getElementById(`collection-delete-${collection.id}`);
        if (deleteCollectionButton) deleteCollectionButton.addEventListener("click", async () => {
            collections.splice(collections.indexOf(collection), 1);
            await chrome.storage.local.set({ "collections": collections });
        });
        const editCollectionButton = document.getElementById(`collection-edit-${collection.id}`)
        if (editCollectionButton) editCollectionButton.addEventListener("click", () => {
            window.location.assign(`edit.html?collection=${collection.id}`);
        });
        const moveUpButton = document.getElementById(`collection-move-up-${collection.id}`);
        if (moveUpButton) moveUpButton.addEventListener("click", async () => {
            const currentIndex = collections.indexOf(collection);
            if (currentIndex > 0) {
                const prevCollection = collections[currentIndex - 1]
                collections[currentIndex - 1] = collection
                collections[currentIndex] = prevCollection
                await chrome.storage.local.set({ "collections": collections });
            }
        })
        const moveDownButton = document.getElementById(`collection-move-down-${collection.id}`);
        if (moveDownButton) moveDownButton.addEventListener("click", async () => {
            const currentIndex = collections.indexOf(collection);
            if (currentIndex < collections.length - 1) {
                const nextCollection = collections[currentIndex + 1]
                collections[currentIndex + 1] = collection
                collections[currentIndex] = nextCollection
                await chrome.storage.local.set({ "collections": collections });
            }
        });

        const optionsButton = document.getElementById(`collection-options-${collection.id}`);
        optionsButton.addEventListener("click", () => {
            const menu = document.getElementById(`col-op-${collection.id}`);
            if (menu.classList.value.includes("float-menu-hide")) {
                menu.classList.remove("float-menu-hide");
                menu.classList.add(`float-menu`);
            } else {
                menu.classList.remove(`float-menu`);
                menu.classList.add("float-menu-hide");
            }
        });

        document.addEventListener("click", (event) => {
            const menu = document.getElementById(`col-op-${collection.id}`);
            if (menu) {
                if (event.target.id != `col-op-${collection.id}` && event.target.parentElement.id != `collection-options-${collection.id}`) {
                    menu.classList.remove("float-menu");
                    menu.classList.add("float-menu-hide");
                }
            }
        })
    }
}

function getUrls(collection) {
    return collection.urls.map((url) => {
        return UrlComponent(url);
    }).join("");
}

function CollectionComponent(collection, isFirst, isLast) {
    const menuOptions = ["edit", "delete"];
    if (!isFirst) menuOptions.push("move-up");
    if (!isLast) menuOptions.push("move-down");

    return `
        <div id="tab-collection-${collection.id}">
            <div class="tabs-collection" id="collection-header-${collection.id}">
                <div class="collection-info">
                    <div class="collection-id" style="background-color: ${collection.color};"></div>
                    <span class="collection-name">${maxString(collection.name, "title")}</span>
                </div>
                <div class="collection-options">
                    <button id="collection-options-${collection.id}" type="button" class="edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 128 512" id="options-button-${collection.id}"><path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"/></svg>
                    </button>
                    <div class="float-menu-hide" id="col-op-${collection.id}">
                        ${menuOptions.map((option) => {
        return MenuOptionComponent(collection, option);
    }).join("")
        }
                    </div>
                </div>
            </div>
            <div class="form" id="urls-collection-${collection.id}">
                ${collection.urls.map((url) => {
            return UrlComponent(url);
        }).join("")
        }
            </div>
        </div>
    `
}

function UrlComponent(url) {
    return `
        <div class="included-url" id="included-url-${url.id}" draggable="${true}">
            <div>
                <span class="url-string">${maxString(url.string, "url")}</span>
            </div>
        </div>
    `
}

function DarkModeIcon() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" class="icon-dark"><path d="M375.7 19.7c-1.5-8-6.9-14.7-14.4-17.8s-16.1-2.2-22.8 2.4L256 61.1 173.5 4.2c-6.7-4.6-15.3-5.5-22.8-2.4s-12.9 9.8-14.4 17.8l-18.1 98.5L19.7 136.3c-8 1.5-14.7 6.9-17.8 14.4s-2.2 16.1 2.4 22.8L61.1 256 4.2 338.5c-4.6 6.7-5.5 15.3-2.4 22.8s9.8 13 17.8 14.4l98.5 18.1 18.1 98.5c1.5 8 6.9 14.7 14.4 17.8s16.1 2.2 22.8-2.4L256 450.9l82.5 56.9c6.7 4.6 15.3 5.5 22.8 2.4s12.9-9.8 14.4-17.8l18.1-98.5 98.5-18.1c8-1.5 14.7-6.9 17.8-14.4s2.2-16.1-2.4-22.8L450.9 256l56.9-82.5c4.6-6.7 5.5-15.3 2.4-22.8s-9.8-12.9-17.8-14.4l-98.5-18.1L375.7 19.7zM269.6 110l65.6-45.2 14.4 78.3c1.8 9.8 9.5 17.5 19.3 19.3l78.3 14.4L402 242.4c-5.7 8.2-5.7 19 0 27.2l45.2 65.6-78.3 14.4c-9.8 1.8-17.5 9.5-19.3 19.3l-14.4 78.3L269.6 402c-8.2-5.7-19-5.7-27.2 0l-65.6 45.2-14.4-78.3c-1.8-9.8-9.5-17.5-19.3-19.3L64.8 335.2 110 269.6c5.7-8.2 5.7-19 0-27.2L64.8 176.8l78.3-14.4c9.8-1.8 17.5-9.5 19.3-19.3l14.4-78.3L242.4 110c8.2 5.7 19 5.7 27.2 0zM256 368a112 112 0 1 0 0-224 112 112 0 1 0 0 224zM192 256a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"/></svg>
    `
}

function LightModeIcon() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 384 512" class="icon-light"><path d="M144.7 98.7c-21 34.1-33.1 74.3-33.1 117.3c0 98 62.8 181.4 150.4 211.7c-12.4 2.8-25.3 4.3-38.6 4.3C126.6 432 48 353.3 48 256c0-68.9 39.4-128.4 96.8-157.3zm62.1-66C91.1 41.2 0 137.9 0 256C0 379.7 100 480 223.5 480c47.8 0 92-15 128.4-40.6c1.9-1.3 3.7-2.7 5.5-4c4.8-3.6 9.4-7.4 13.9-11.4c2.7-2.4 5.3-4.8 7.9-7.3c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-3.7 .6-7.4 1.2-11.1 1.6c-5 .5-10.1 .9-15.3 1c-1.2 0-2.5 0-3.7 0c-.1 0-.2 0-.3 0c-96.8-.2-175.2-78.9-175.2-176c0-54.8 24.9-103.7 64.1-136c1-.9 2.1-1.7 3.2-2.6c4-3.2 8.2-6.2 12.5-9c3.1-2 6.3-4 9.6-5.8c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-3.6-.3-7.1-.5-10.7-.6c-2.7-.1-5.5-.1-8.2-.1c-3.3 0-6.5 .1-9.8 .2c-2.3 .1-4.6 .2-6.9 .4z"/></svg>
    `
}

async function getCurrentTheme() {
    // Get theme from storage
    const result = await chrome.storage.local.get(["theme"]);
    if (!result.theme) chrome.storage.local.set({ "theme": "dark" });
    return result.theme ?? "dark";
}

function maxString(value, type) {
    switch (type) {
        case "url":
            if (value.length > 47) return value.substring(0, 50) + "...";
            return value;
        case "title":
            if (value.length > 17) return value.substring(0, 14) + "...";
            return value;
        default:
            return value;
    }
}

function MenuOptionComponent(collection, action) {
    return `
        <button id="collection-${action}-${collection.id}" class="default-button">
            <span id="collection-${action}-text-${collection.id}"></span>
        </button>
    `
}