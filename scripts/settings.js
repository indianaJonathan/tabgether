const MAX_URLS = 5;
const MAX_COLLECTIONS = 7;

window.onload = () => {
    getCollections();
    chrome.storage.onChanged.addListener(() => {
        getCollections();
    });
    document.getElementById('add-button').addEventListener("click", async (event) => {
        add_input = document.getElementById("txt-area-add");
        const value = add_input.value;
        if (value && value !== "") {
            const currentCollections = await chrome.storage.local.get(["collections"]);
            const cols = currentCollections.collections || [];
            const newRow = { "id": cols && cols.length > 0 ? cols.length + 1 : 1, "name": value, "urls": [], color: getRandomColor()};
            if (cols && cols.length < MAX_COLLECTIONS) cols.push(newRow);
            chrome.storage.local.set({ "collections": cols } );
            add_input.value = "";
        }
    });
}

function getRandomColor () {
    const colors = ["#C66750", "#5CA758", "#B2B059", "#5D80B5"];
    var color = colors[Math.floor(Math.random()*colors.length)];
    return color;
}

function getCollections () {
    chrome.storage.local.get(["collections", "theme"]).then((result) => {
        pageMain = document.getElementById("settings-page");
        listClasses = pageMain.classList;
        mode_button = document.getElementById("dark_light_mode_button");
        add_input = document.getElementById("txt-area-add");
        add_input.classList.value = `input-${result.theme}`;
        back_icon = document.getElementById("back-icon")
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
                mode_button.title = "Toggle to light mode"
            } else if (result.theme && result.theme == "light") {
                if (listClasses.value == "full-page-dark") {
                    pageMain.classList.remove("full-page-dark");
                }
                pageMain.classList.add("full-page-light");
                mode_button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 384 512" class="icon-${result.theme}"><path d="M144.7 98.7c-21 34.1-33.1 74.3-33.1 117.3c0 98 62.8 181.4 150.4 211.7c-12.4 2.8-25.3 4.3-38.6 4.3C126.6 432 48 353.3 48 256c0-68.9 39.4-128.4 96.8-157.3zm62.1-66C91.1 41.2 0 137.9 0 256C0 379.7 100 480 223.5 480c47.8 0 92-15 128.4-40.6c1.9-1.3 3.7-2.7 5.5-4c4.8-3.6 9.4-7.4 13.9-11.4c2.7-2.4 5.3-4.8 7.9-7.3c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-3.7 .6-7.4 1.2-11.1 1.6c-5 .5-10.1 .9-15.3 1c-1.2 0-2.5 0-3.7 0c-.1 0-.2 0-.3 0c-96.8-.2-175.2-78.9-175.2-176c0-54.8 24.9-103.7 64.1-136c1-.9 2.1-1.7 3.2-2.6c4-3.2 8.2-6.2 12.5-9c3.1-2 6.3-4 9.6-5.8c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-3.6-.3-7.1-.5-10.7-.6c-2.7-.1-5.5-.1-8.2-.1c-3.3 0-6.5 .1-9.8 .2c-2.3 .1-4.6 .2-6.9 .4z"/></svg>                    
                `
                mode_button.title = "Toggle to dark mode"
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
        let output = `<span>No collections found</span>`;
        if (result.collections && result.collections.length > 0) {
            if (result.collections.length < MAX_COLLECTIONS) {
                document.getElementById("add-collection").style.display = "flex";
            } else {
                document.getElementById("add-collection").style.display = "none";
            }
            output = "";
            for (let item of result.collections) {
                output += `
                    <div class="border-${result.theme}">
                        <div class="tabs-collection" title="${item.name} collection" id="collection-header-${item.id}">
                        </div>
                        <form action="" class="form" id="include-url-${item.id}">
                            ${getUrls(item, result.theme)}
                        </form>
                    </div>
                `;
            } 
        }
        document.getElementById("container").innerHTML = output;
        document.getElementById("container").classList.value = `container-${result.theme}`
        if (result.collections && result.collections.length > 0) {
            const collections = result.collections;
            for (let item of collections) {
                getDefaultCollectionHeader(item, collections, result.theme);
                if (item.urls.length < MAX_URLS) {
                    document.getElementById(`include-url-${item.id}`).addEventListener("submit", (event) => {
                        handleAddUrlSubmit(item, collections);
                    });
                }
                if (item.urls.length > 0) {
                    for (let url of item.urls) {
                        getDefaultUrlElement(url, item, collections, result.theme);
                    }
                }
            }
        }
    });
}

function getUrls (item, theme) {
    let output = "";
    let canAdd = true;
    if (item.urls && item.urls.length > 0) {
        for (let url of item.urls) {
            output += `
                <div class="included-url" id="included-url-${url.id}" title="${url.string}" draggable="${true}">
                    <div>
                        <span class="url-string">${maxString(url.string, "url")}</span>
                    </div>
                    <div class="url-options">
                        <button class="edit" type="button" id="edit-url-button-${url.id}" title="Edit ${url.string} tab from ${item.name} collection">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 512 512" class="icon-${theme}"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
                        </button>
                        <button class="delete" type="button" id="delete-url-button-${url.id}" title="Remove ${url.string} tab from ${item.name} collection">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" class="danger-icon"><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"/></svg>
                        </button>
                    </div>
                </div>
            `;
        }
        if (item.urls.length >= MAX_URLS) {
            canAdd = false;
        }
    }
    if (canAdd == true) output += `
                            <div class="input-add">
                                <input type="text" id="txt-area-url-${item.id}" placeholder="Type the new url" class="input-${theme}"/>
                                <button id="add-url-button-${item.id}" class="add-button" type="submit">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 448 512" class="icon-${theme}"><path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/></svg>
                                </button>
                            </div>
                        `;
    return output;
}

function handleAddUrlSubmit (item, collections) {
    const value = document.getElementById(`txt-area-url-${item.id}`).value;
    for (let col of collections) {
        if (col.id == item.id) {
            if (value && value !== "") {
                const urls = col.urls;
                urls.push({ "id": `${item.id}-${item.urls.length}`, "string": value.startsWith("http") ? value : `https://${value}` });
                chrome.storage.local.set({ "collections": collections });
            }
        }
    }
}

function maxString (value, type) {
    switch (type) {
        case "url":
            if (value.length > 38) return value.substring(0, 35) + "...";
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
            <div class="collection-id" style="background-color: ${collection.color};">${collection.id}</div>
            <span class="collection-name">${maxString(collection.name, "title")}</span>
        </div>
        <div class="collection-options">
            <button id="collection-edit-${collection.id}" type="button" class="edit" title="Edit ${collection.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512" class="icon-${theme}"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
            </button>
            <button id="collection-delete-${collection.id}" type="button" class="delete" title="Delete ${collection.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 448 512" class="danger-icon"><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"/></svg>
            </button>
        </div>
    `
    setCollectionActions(collection, collections, theme);
}

function getEditCollectionHeader (collection, collections, theme) {
    isFirst = false;
    isLast = false;
    if (collections.indexOf(collection) == 0) {
        isFirst = true;
    }
    if (collections.indexOf(collection) == (collections.length - 1)) {
        isLast = true;
    }
    url_element = document.getElementById(`collection-header-${collection.id}`);
    url_element.innerHTML = `
        <div class="collection-info">
            <div class="collection-move-options">
                <button id="collection-move-down-${collection.id}" type="button" class="collection-edit-arrow" ${isLast ? 'disabled' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="15" width="15" viewBox="0 0 448 512" class="option${isLast ? '-disabled' : ''}-icon"><path d="M413.1 222.5l22.2 22.2c9.4 9.4 9.4 24.6 0 33.9L241 473c-9.4 9.4-24.6 9.4-33.9 0L12.7 278.6c-9.4-9.4-9.4-24.6 0-33.9l22.2-22.2c9.5-9.5 25-9.3 34.3.4L184 343.4V56c0-13.3 10.7-24 24-24h32c13.3 0 24 10.7 24 24v287.4l114.8-120.5c9.3-9.8 24.8-10 34.3-.4z"/></svg>
                </button>
                <button id="collection-move-up-${collection.id}" type="button" class="collection-edit-arrow" ${isFirst ? 'disabled' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="15" width="15" viewBox="0 0 448 512" class="option${isFirst ? '-disabled' : ''}-icon"><path d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z"/></svg>
                </button>
            </div>
            <input class="color-picker" type="color" value="${collection.color}" id="input-collection-edit-color-${collection.id}"/>
            <input class="input-collection-edit input-${theme}" type="text" value="${collection.name}" id="input-collection-edit-${collection.id}"/>
        </div>
        <div class="collection-options">
            <button id="collection-save-${collection.id}" type="button" class="save" title="Save ${collection.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 448 512" class="icon-${theme}"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
            </button>
            <button id="collection-cancel-${collection.id}" type="button" class="cancel" title="Cancel changes on ${collection.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 384 512" class="danger-icon"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            </button>
        </div>
    `
    setCollectionActions(collection, collections, theme);
}

function setCollectionActions (collection, collections, theme) {
    edit_collection_button = document.getElementById(`collection-edit-${collection.id}`);
    if (edit_collection_button) {
        edit_collection_button.addEventListener("click", (event) => {
            getEditCollectionHeader(collection, collections, theme);
        });
    }
    delete_collection_button = document.getElementById(`collection-delete-${collection.id}`);
    if (delete_collection_button) {
        delete_collection_button.addEventListener("click", (event) => {
            collections.splice(collections.indexOf(collection), 1);
            chrome.storage.local.set({ "collections": collections });
        });
    }
    save_collection_button = document.getElementById(`collection-save-${collection.id}`);
    if (save_collection_button) {
        save_collection_button.addEventListener("click", (event) => {
            collection.name = document.getElementById(`input-collection-edit-${collection.id}`).value;
            collection.color = document.getElementById(`input-collection-edit-color-${collection.id}`).value;
            getDefaultCollectionHeader(collection, collections, theme);
            chrome.storage.local.set({ "collections": collections });
        });
    }
    cancel_collection_button = document.getElementById(`collection-cancel-${collection.id}`);
    if (cancel_collection_button) {
        cancel_collection_button.addEventListener("click", (event) => {
            getDefaultCollectionHeader(collection, collections, theme);
            chrome.storage.local.set({ "collections": collections });
        });
    }
    move_up_collection_button = document.getElementById(`collection-move-up-${collection.id}`)
    if (move_up_collection_button) {
        move_up_collection_button.addEventListener("click", (event) => {
            current_index = collections.indexOf(collection);
            element_before = collections[current_index - 1]
            collections[current_index - 1] = collection
            collections[current_index] = element_before
            chrome.storage.local.set({ "collections": collections });
        });
    }
    move_down_collection_button = document.getElementById(`collection-move-down-${collection.id}`)
    if (move_down_collection_button) {
        move_down_collection_button.addEventListener("click", (event) => {
            current_index = collections.indexOf(collection);
            element_after = collections[current_index + 1]
            collections[current_index + 1] = collection
            collections[current_index] = element_after
            chrome.storage.local.set({ "collections": collections });
        });
    }
}

function getDefaultUrlElement (url, item, collections, theme) {
    url_element = document.getElementById(`included-url-${url.id}`);
    url_element.innerHTML = `
        <div>
            <span class="url-string">${maxString(url.string, "url")}</span>
        </div>
        <div class="url-options">
            <button class="edit" type="button" id="edit-url-button-${url.id}" title="Edit ${url.string} tab from ${item.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 512 512" class="icon-${theme}"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
            </button>
            <button class="delete" type="button" id="delete-url-button-${url.id}" title="Remove ${url.string} tab from ${item.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" class="danger-icon"><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"/></svg>
            </button>
        </div>
    `
    setUrlButtonsActions(url, item, collections, theme);
}

function getEditUrlElement (url, item, collections, theme) {
    isFirst = false;
    isLast = false;
    if (item.urls.indexOf(url) == 0) {
        isFirst = true
    }
    if (item.urls.indexOf(url) == (item.urls.length - 1)) {
        isLast = true
    }
    url_element = document.getElementById(`included-url-${url.id}`);
    url_element.innerHTML = `
        <div class="url-edit-options">
            <button id="url-down-option-${url.id}" type="button" class="url-edit-arrow" ${isLast ? 'disabled' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 448 512" class="option${isLast ? '-disabled' : ''}-icon"><path d="M413.1 222.5l22.2 22.2c9.4 9.4 9.4 24.6 0 33.9L241 473c-9.4 9.4-24.6 9.4-33.9 0L12.7 278.6c-9.4-9.4-9.4-24.6 0-33.9l22.2-22.2c9.5-9.5 25-9.3 34.3.4L184 343.4V56c0-13.3 10.7-24 24-24h32c13.3 0 24 10.7 24 24v287.4l114.8-120.5c9.3-9.8 24.8-10 34.3-.4z"/></svg>
            </button>
            <button id="url-up-option-${url.id}" type="button" class="url-edit-arrow" ${isFirst ? 'disabled' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 448 512" class="option${isFirst ? '-disabled' : ''}-icon"><path d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z"/></svg>
            </button>
            <input class="input-edit input-${theme}" type="text" value="${url.string}" id="input-url-edit-${url.id}" />
        </div>
        <div class="url-options">
            <button class="save" type="button" id="save-url-button-${url.id}" title="Save edit on ${url.string} tab from ${item.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" class="icon-${theme}"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
            </button>
            <button class="cancel" type="button" id="cancel-url-button-${url.id}" title="Cancel edit on ${url.string} tab from ${item.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 384 512" class="danger-icon"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            </button>
        </div>
    `
    setUrlButtonsActions(url, item, collections, theme);
}

function setUrlButtonsActions (url, item, collections, theme) {
    url_element = document.getElementById(`included-url-${url.id}`);
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
    delete_button = document.getElementById(`delete-url-button-${url.id}`);
    if (delete_button) {
        delete_button.addEventListener("click", (event) => {
            item.urls.splice(item.urls.indexOf(url), 1);
            chrome.storage.local.set({ "collections": collections });
        });
    }
    edit_button = document.getElementById(`delete-url-button-${url.id}`);
    if (edit_button) {
        document.getElementById(`edit-url-button-${url.id}`).addEventListener("click", (event) => {
            getEditUrlElement(url, item, collections, theme);
        });
    }
    save_button = document.getElementById(`save-url-button-${url.id}`);
    if (save_button) {
        document.getElementById(`save-url-button-${url.id}`).addEventListener("click", (event) => {
            url.string = document.getElementById(`input-url-edit-${url.id}`).value;
            getDefaultUrlElement(url, item, collections, theme);
            chrome.storage.local.set({ "collections": collections });
        });
    }
    cancel_button = document.getElementById(`cancel-url-button-${url.id}`);
    if (cancel_button) {
        document.getElementById(`cancel-url-button-${url.id}`).addEventListener("click", (event) => {
            getDefaultUrlElement(url, item, collections, theme);
            chrome.storage.local.set({ "collections": collections });
        });
    }
    move_up_button = document.getElementById(`url-up-option-${url.id}`);
    if (move_up_button) {
        move_up_button.addEventListener("click", (event) => {
            current_index = item.urls.indexOf(url);
            element_before = item.urls[current_index - 1]
            item.urls[current_index - 1] = url
            item.urls[current_index] = element_before
            chrome.storage.local.set({ "collections": collections });
        });
    }
    move_down_button = document.getElementById(`url-down-option-${url.id}`);
    if (move_down_button) {
        move_down_button.addEventListener("click", (event) => {
            current_index = item.urls.indexOf(url);
            element_after = item.urls[current_index + 1]
            item.urls[current_index + 1] = url
            item.urls[current_index] = element_after
            collections[collections.indexOf(item)] = item
            chrome.storage.local.set({ "collections": collections });
        });
    }
}