const MAX_URLS = 5;
const MAX_COLLECTIONS = 7;

window.onload = () => {
    getCollections();
    chrome.storage.onChanged.addListener(() => {
        getCollections();
    });
    document.getElementById('add-button').addEventListener("click", async (event) => {
        const value = document.getElementById("txt-area-add").value;
        if (value && value !== "") {
            const currentCollections = await chrome.storage.local.get(["collections"]);
            const cols = currentCollections.collections || [];
            const newRow = { "id": cols && cols.length > 0 ? cols.length + 1 : 1, "name": value, "urls": [], color: getRandomColor()};
            if (cols && cols.length < MAX_COLLECTIONS) cols.push(newRow);
            chrome.storage.local.set({ "collections": cols } );
            document.getElementById("txt-area-add").value = "";
        }
    });
}

function getRandomColor () {
    const colors = ["#C66750", "#5CA758", "#B2B059", "#5D80B5"];
    var color = colors[Math.floor(Math.random()*colors.length)];
    return color;
}

function getCollections () {
    chrome.storage.local.get(["collections"]).then((result) => {
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
                    <div class="border">
                        <div class="tabs-collection" title="${item.name} collection">
                            <div class="collection-info">
                                <div class="collection-id" style="background-color: ${item.color};">${item.id}</div>
                                <span class="collection-name">${maxString(item.name, "title")}</span>
                            </div>
                            <button id="collection-delete-${item.id}" type="button" class="delete" title="Delete ${item.name} collection">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512" class="danger-icon"><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"/></svg>
                            </button>
                        </div>
                        <form action="" class="form" id="include-url-${item.id}">
                            ${getUrls(item)}
                        </form>
                    </div>
                `;
            } 
        }
        document.querySelector(".container").innerHTML = output;
        if (result.collections && result.collections.length > 0) {
            const collections = result.collections;
            for (let item of collections) {
                if (item.urls.length < MAX_URLS) {
                    document.getElementById(`include-url-${item.id}`).addEventListener("submit", (event) => {
                        handleAddUrlSubmit(item, collections);
                    });
                }
                if (item.urls.length > 0) {
                    for (let url of item.urls) {
                        getDefaultUrlElement(url, item, collections);
                    }
                }
                document.getElementById(`collection-delete-${item.id}`).addEventListener("click", (event) => {
                    collections.splice(collections.indexOf(item), 1);
                    chrome.storage.local.set({ "collections": collections });
                });
            }
        }
    });
}

function getUrls (item) {
    let output = "";
    let canAdd = true;
    if (item.urls && item.urls.length > 0) {
        for (let url of item.urls) {
            output += `
                <div class="included-url" id="included-url-${url.id}" title="${url.string}">
                    <div>
                        <span class="url-string">${maxString(url.string, "url")}</span>
                    </div>
                    <div class="url-options">
                        <button class="edit" type="button" id="edit-url-button-${url.id}" title="Edit ${url.string} tab from ${item.name} collection">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 512 512" class="edit-icon"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
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
                                <input type="text" id="txt-area-url-${item.id}" placeholder="Type the new url"/>
                                <button id="add-url-button-${item.id}" class="add-button" type="submit">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 448 512" class="icon"><path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/></svg>
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
                urls.push({"id": `${item.id}-${item.urls.length}`, "string": value.startsWith("http") ? value : `https://${value}`});
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

function getDefaultUrlElement (url, item, collections) {
    url_element = document.getElementById(`included-url-${url.id}`);
    url_element.innerHTML = `
        <div>
            <span class="url-string">${maxString(url.string, "url")}</span>
        </div>
        <div class="url-options">
            <button class="edit" type="button" id="edit-url-button-${url.id}" title="Edit ${url.string} tab from ${item.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 512 512" class="edit-icon"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
            </button>
            <button class="delete" type="button" id="delete-url-button-${url.id}" title="Remove ${url.string} tab from ${item.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" class="danger-icon"><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"/></svg>
            </button>
        </div>
    `
    setUrlButtonsActions(url, item, collections);
}

function getEditUrlElement (url, item, collections) {
    url_element = document.getElementById(`included-url-${url.id}`);
    url_element.innerHTML = `
        <div>
            <input class="input-edit" type="text" value="${url.string}" id="input-url-edit-${url.id}" />
        </div>
        <div class="url-options">
            <button class="save" type="button" id="save-url-button-${url.id}" title="Save edit on ${url.string} tab from ${item.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" class="icon"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
            </button>
            <button class="cancel" type="button" id="cancel-url-button-${url.id}" title="Cancel edit on ${url.string} tab from ${item.name} collection">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 384 512" class="danger-icon"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            </button>
        </div>
    `
    setUrlButtonsActions(url, item, collections);
}

function setUrlButtonsActions (url, item, collections) {
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
            getEditUrlElement(url, item, collections);
        });
    }
    save_button = document.getElementById(`save-url-button-${url.id}`);
    if (save_button) {
        document.getElementById(`save-url-button-${url.id}`).addEventListener("click", (event) => {
            url.string = document.getElementById(`input-url-edit-${url.id}`).value;
            getDefaultUrlElement(url, item, collections);
            chrome.storage.local.set({ "collections": collections });
        });
    }
    cancel_button = document.getElementById(`cancel-url-button-${url.id}`);
    if (cancel_button) {
        document.getElementById(`cancel-url-button-${url.id}`).addEventListener("click", (event) => {
            getDefaultUrlElement(url, item, collections);
            chrome.storage.local.set({ "collections": collections });
        });
    }
}