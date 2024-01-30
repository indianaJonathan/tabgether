let lang = {};

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
    pageTitle = document.getElementById("page-title");
    pageTitle.innerHTML = lang.titles.settings;
    chrome.storage.local.get(["collections", "theme", "language"]).then((result) => {
        pageMain = document.getElementById("settings-page");
        listClasses = pageMain.classList;
        mode_button = document.getElementById("dark_light_mode_button");
        back_icon = document.getElementById("back-icon");
        backButton = document.getElementById("back");
        backButton.title = lang.buttons.titles.back;
        addButton = document.getElementById("add-new-collection-button");
        addButton.title = lang.buttons.titles.add_collection;
        const langSelect = document.getElementById("language-select");
        langSelect.value = selectedLang;
        langSelect.classList.value = `input-select-${result.theme}`;
        langSelect.addEventListener("change", () => {
            chrome.storage.local.set({"language": langSelect.value});
        });
        icons = [back_icon]
        for (icon of icons) {
            icon.classList.value = `icon-${result.theme}`
        }
        if (mode_button) {
            if (result.theme && result.theme == "dark") {
                if (listClasses.value == "full-page-light") {
                    pageMain.classList.remove("full-page-light");
                }
                pageMain.classList.add("full-page-dark");
                mode_button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" class="icon-${result.theme}"><path d="M375.7 19.7c-1.5-8-6.9-14.7-14.4-17.8s-16.1-2.2-22.8 2.4L256 61.1 173.5 4.2c-6.7-4.6-15.3-5.5-22.8-2.4s-12.9 9.8-14.4 17.8l-18.1 98.5L19.7 136.3c-8 1.5-14.7 6.9-17.8 14.4s-2.2 16.1 2.4 22.8L61.1 256 4.2 338.5c-4.6 6.7-5.5 15.3-2.4 22.8s9.8 13 17.8 14.4l98.5 18.1 18.1 98.5c1.5 8 6.9 14.7 14.4 17.8s16.1 2.2 22.8-2.4L256 450.9l82.5 56.9c6.7 4.6 15.3 5.5 22.8 2.4s12.9-9.8 14.4-17.8l18.1-98.5 98.5-18.1c8-1.5 14.7-6.9 17.8-14.4s2.2-16.1-2.4-22.8L450.9 256l56.9-82.5c4.6-6.7 5.5-15.3 2.4-22.8s-9.8-12.9-17.8-14.4l-98.5-18.1L375.7 19.7zM269.6 110l65.6-45.2 14.4 78.3c1.8 9.8 9.5 17.5 19.3 19.3l78.3 14.4L402 242.4c-5.7 8.2-5.7 19 0 27.2l45.2 65.6-78.3 14.4c-9.8 1.8-17.5 9.5-19.3 19.3l-14.4 78.3L269.6 402c-8.2-5.7-19-5.7-27.2 0l-65.6 45.2-14.4-78.3c-1.8-9.8-9.5-17.5-19.3-19.3L64.8 335.2 110 269.6c5.7-8.2 5.7-19 0-27.2L64.8 176.8l78.3-14.4c9.8-1.8 17.5-9.5 19.3-19.3l14.4-78.3L242.4 110c8.2 5.7 19 5.7 27.2 0zM256 368a112 112 0 1 0 0-224 112 112 0 1 0 0 224zM192 256a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"/></svg>
                `
                mode_button.title = lang.buttons.titles.toggle_mode_light;
            } else if (result.theme && result.theme == "light") {
                if (listClasses.value == "full-page-dark") {
                    pageMain.classList.remove("full-page-dark");
                }
                pageMain.classList.add("full-page-light");
                mode_button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 384 512" class="icon-${result.theme}"><path d="M144.7 98.7c-21 34.1-33.1 74.3-33.1 117.3c0 98 62.8 181.4 150.4 211.7c-12.4 2.8-25.3 4.3-38.6 4.3C126.6 432 48 353.3 48 256c0-68.9 39.4-128.4 96.8-157.3zm62.1-66C91.1 41.2 0 137.9 0 256C0 379.7 100 480 223.5 480c47.8 0 92-15 128.4-40.6c1.9-1.3 3.7-2.7 5.5-4c4.8-3.6 9.4-7.4 13.9-11.4c2.7-2.4 5.3-4.8 7.9-7.3c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-3.7 .6-7.4 1.2-11.1 1.6c-5 .5-10.1 .9-15.3 1c-1.2 0-2.5 0-3.7 0c-.1 0-.2 0-.3 0c-96.8-.2-175.2-78.9-175.2-176c0-54.8 24.9-103.7 64.1-136c1-.9 2.1-1.7 3.2-2.6c4-3.2 8.2-6.2 12.5-9c3.1-2 6.3-4 9.6-5.8c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-3.6-.3-7.1-.5-10.7-.6c-2.7-.1-5.5-.1-8.2-.1c-3.3 0-6.5 .1-9.8 .2c-2.3 .1-4.6 .2-6.9 .4z"/></svg>                    
                `
                mode_button.title = lang.buttons.titles.toggle_mode_dark;
            } else {
                pageMain.classList.add("full-page-dark");
            }
            mode_button.addEventListener("click", (event) => {
                switch (result.theme) {
                    case "dark":
                        chrome.storage.local.set({"theme": "light"});
                        break;
                    case "light":
                        chrome.storage.local.set({"theme": "dark"});
                        break;
                    default:
                        chrome.storage.local.set({"theme": "dark"});
                        break;
                }
            });
        }
        let output = `<span>${lang.others.span.no_collections_found}</span>`;
        if (result.collections && result.collections.length > 0) {
            output = "";
            for (let item of result.collections) {
                if (item) {
                    output += `
                        <div class="border-${result.theme}">
                            <div class="tabs-collection" id="collection-header-${item.id}">
                            </div>
                            <div class="form" id="urls-collection-${item.id}">
                                ${getUrls(item, result.theme)}
                            </div>
                        </div>
                    `;
                }
            } 
        }
        document.getElementById("container").innerHTML = output;
        document.getElementById("container").classList.value = `container-${result.theme}`
        if (result.collections && result.collections.length > 0) {
            const collections = result.collections;
            for (let item of collections) {
                if (item) {
                    getDefaultCollectionHeader(item, collections, result.theme);
                    if (item.urls.length > 0) {
                        for (let url of item.urls) {
                            getDefaultUrlElement(url, item, collections, result.theme);
                        }
                    }
                }
            }
        }
    });
}

function getUrls (item) {
    let output = "";
    if (item.urls && item.urls.length > 0) {
        for (let url of item.urls) {
            output += `
                <div class="included-url" id="included-url-${url.id}" draggable="${true}">
                    <div>
                        <span class="url-string">${maxString(url.string, "url")}</span>
                    </div>
                </div>
            `;
        }
    }
    return output;
}

function maxString (value, type) {
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

function getDefaultCollectionHeader (collection, collections, theme) {
    url_element = document.getElementById(`collection-header-${collection.id}`);
    url_element.innerHTML = `
        <div class="collection-info">
            <div class="collection-id" style="background-color: ${collection.color};"></div>
            <span class="collection-name">${maxString(collection.name, "title")}</span>
        </div>
        <div class="collection-options">
            <button id="collection-options-${collection.id}" type="button" class="edit" title="${lang.buttons.titles.collection_options}">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 128 512" class="icon-${theme}"><path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"/></svg>
            </button>
            <div class="float-menu-hide" id="col-op-${collection.id}">
                <button id="collection-edit-${collection.id}" class="default-button" title="${lang.buttons.titles.edit_collection}">
                    <span>${lang.buttons.captions.edit}</span>
                </button>
                <button id="collection-move-up-${collection.id}" class="default-button" title="${lang.buttons.titles.move_collection_up}">
                    <span>${lang.buttons.captions.move_up}</span>
                </button>
                <button id="collection-move-down-${collection.id}" class="default-button" title="${lang.buttons.titles.move_collection_down}">
                    <span>${lang.buttons.captions.move_down}</span>
                </button>
                <button id="collection-delete-${collection.id}" class="default-button" title="${lang.buttons.titles.delete_collection}">
                    <span>${lang.buttons.captions.delete}</span>
                </button>
            </div>
        </div>
    `
    setCollectionActions(collection, collections, theme);
}

function setCollectionActions (collection, collections, theme) {
    delete_collection_button = document.getElementById(`collection-delete-${collection.id}`);
    if (delete_collection_button) {
        delete_collection_button.addEventListener("click", (event) => {
            collections.splice(collections.indexOf(collection), 1);
            chrome.storage.local.set({ "collections": collections });
        });
    }
    edit_collection_button = document.getElementById(`collection-edit-${collection.id}`)
    if (edit_collection_button) {
        edit_collection_button.addEventListener("click", () => {
            window.location.assign(`edit.html?collection=${collection.id}`);
        });
    }
    moveUpButton = document.getElementById(`collection-move-up-${collection.id}`);
    if (collections.indexOf(collection) == 0) {
        moveUpButton.style.display = "none";
    } else {
        moveUpButton.addEventListener("click", () => {
            const currentIndex = collections.indexOf(collection);
            if (currentIndex > 0) {
                const prevCollection = collections[currentIndex - 1]
                collections[currentIndex - 1] = collection
                collections[currentIndex] = prevCollection
                chrome.storage.local.set({ "collections": collections });
            }
        })
    }
    moveDownButton = document.getElementById(`collection-move-down-${collection.id}`);
    if (collections.indexOf(collection) == collections.length - 1) {
        moveDownButton.style.display = "none";
    } else {
        moveDownButton.addEventListener("click", () => {
            const currentIndex = collections.indexOf(collection);
            if (currentIndex < collections.length - 1) {
                const nextCollection = collections[currentIndex + 1]
                collections[currentIndex + 1] = collection
                collections[currentIndex] = nextCollection
                chrome.storage.local.set({ "collections": collections });
            }
        })
    }

    optionsButton = document.getElementById(`collection-options-${collection.id}`);
    optionsButton.addEventListener("click", () => {
        menu = document.getElementById(`col-op-${collection.id}`);
        if (menu.classList.value.includes("float-menu-hide")) {
            menu.classList.remove("float-menu-hide");
            menu.classList.add(`float-menu-${theme}`);
        } else {
            menu.classList.remove(`float-menu-${theme}`);
            menu.classList.add("float-menu-hide");
        }
    });

    document.addEventListener("click", (event) => {
        menu = document.getElementById(`col-op-${collection.id}`);
        if (menu) {
            if (event.target.id != `col-op-${collection.id}` && event.target.parentElement.id != `collection-options-${collection.id}`) {
                menu.classList.remove(`float-menu-${theme}`);
                menu.classList.add("float-menu-hide");
            }
        }
    })
}

function getDefaultUrlElement (url, item, collections, theme) {
    url_element = document.getElementById(`included-url-${url.id}`);
    url_element.innerHTML = `
        <div title="${lang.others.titles.drag_drop_url}" class="url-element">
            <div id="drag-icon-url-${url.id}" style="width: 10px">
            </div>
            <span class="url-string">${maxString(url.string, "url")}</span>
        </div>
    `
    setUrlButtonsActions(url, item, collections, theme);
}

function setUrlButtonsActions (url, item, collections, theme) {
    url_element = document.getElementById(`included-url-${url.id}`);
    url_element.addEventListener("mouseenter", () => {
        dragIcon = document.getElementById(`drag-icon-url-${url.id}`);
        dragIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width=10 height=10 viewBox="0 0 320 512" class="icon-${theme}"><path d="M40 352l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zm192 0l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 320c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 192l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 160c-22.1 0-40-17.9-40-40L0 72C0 49.9 17.9 32 40 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40z"/></svg>`
    });
    url_element.addEventListener("mouseleave", () => {
        dragIcon = document.getElementById(`drag-icon-url-${url.id}`);
        dragIcon.innerHTML = "";
    });
    if (url_element) {
        url_element.addEventListener("dragstart", (event) => {
            selected_url = event.target.id;
            event
                .dataTransfer
                .setData('text/plain', event.target.id);

            event
                .currentTarget
                .style
                .border = "1px dashed #909090";
            event
                .currentTarget
                .style
                .borderRadius = "1rem";
        });
        url_element.addEventListener("dragover", (event) => {
            event.preventDefault();
        });
        url_element.addEventListener("drop", (event) => {
            const id = event
                .dataTransfer
                .getData('text');
            const selected_element_id = document.getElementById(id).id;
            const dropzone = event.target;
            event
                .dataTransfer
                .clearData();
            target_element_id = dropzone.parentElement.parentElement.id;
            target_element = item.urls.find((it) => target_element_id === `included-url-${it.id}`);
            target_element_index = item.urls.indexOf(target_element);
            selected_element = item.urls.find((it) => selected_element_id === `included-url-${it.id}`);
            selected_element_index = item.urls.indexOf(selected_element);
            
            item.urls.splice(selected_element_index, 1);
            item.urls.splice(target_element_index < selected_element_index ? target_element_index - 1 : target_element_index, 0, selected_element);
            chrome.storage.local.set({ "collections": collections });
        });
    }
}