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
            if (cols && cols.length < 5) cols.push(newRow);
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
            output = "";
            for (let item of result.collections) {
                output += `
                    <div class="border">
                        <div class="tabs-collection" title="${item.name} collection">
                            <div class="collection-info">
                                <div class="collection-id" style="background-color: ${item.color};">${item.id}</div>
                                <span class="collection-name">${item.name}</span>
                            </div>
                            <button id="collection-delete-${item.id}" type="button" class="delete">
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
                if (item.urls.length < 3) {
                    document.getElementById(`include-url-${item.id}`).addEventListener("submit", (event) => {
                        handleAddUrlSubmit(item, collections);
                    });
                }
                if (item.urls.length > 0) {
                    for (let url of item.urls) {
                        document.getElementById(`delete-url-button-${url.id}`).addEventListener("click", (event) => {
                            item.urls.splice(item.urls.indexOf(url), 1);
                            chrome.storage.local.set({ "collections": collections });
                        });
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
                <div class="included-url" id="included-url-${url.id}">
                    <span class="url-string">${url.string}</span>
                    <button class="delete" type="button" id="delete-url-button-${url.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" class="danger-icon"><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"/></svg>
                    </button>
                </div>
            `;
        }
        if (item.urls.length >= 3) {
            canAdd = false;
        }
    }
    if (canAdd == true) output += `
                            <div class="input-add">
                                <input type="text" id="txt-area-url-${item.id}"/>
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