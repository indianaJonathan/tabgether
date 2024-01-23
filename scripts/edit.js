var edit_collection = {id: "", name: "", color: "", urls: []}
var urls = []

window.onload = () => {
  loadData();
  loadListeners();
}

function loadData () {
  chrome.storage.local.get(["theme"]).then((result) => {
    pageMain = document.getElementById("edit-page");
    collectionNameInput = document.getElementById("collection-name-input")
    collectionColorInput = document.getElementById("collection-color-input")
    newUrlInput = document.getElementById("new-url")
    urlsArea = document.getElementById("urls-area")
    back_icon = document.getElementById("back-icon")
    save_icon = document.getElementById("save-icon")
    icons = [back_icon]
    for (icon of icons) {
        icon.classList.value = `icon-${result.theme}`
    }
    pageMain.classList.add(`full-page-${result.theme}`);
    collectionNameInput.classList.add(`input-${result.theme}`)
    collectionColorInput.classList.add(`input-color-${result.theme}`)
    urlsArea.classList.add(`border-${result.theme}`)
    newUrlInput.classList.add(`input-${result.theme}`)
    save_icon.classList.add(`icon-dark`)

    chrome.storage.local.get(["collections"]).then((result) => {
        const collectionId = window.location.search.split("=")[1];
        const col = result.collections.find((col) => col.id == collectionId);
        if (col) {
          edit_collection = col;
          collectionColorInput.value = col.color;
          collectionNameInput.value = col.name;
          urls = col.urls;
            loadUrls();
        } else {
            alert(`Could not find collection ${collectionId}`);
            navigation.back();
        }
    });
  });
}

function loadListeners () {
  var addingUrl = false;
  const add_url_button = document.getElementById("add-url-button");
  add_url_button.addEventListener("click", (event) => {addUrl()});
  const newUrlInput = document.getElementById("new-url");
  newUrlInput.addEventListener("focus", () => {
    addingUrl = true;
  });
  newUrlInput.addEventListener("blur", () => {
    addingUrl = false;
  });
  const collection_form = document.getElementById("edit-collection-form");
  collection_form.addEventListener("submit", async (event) => {
    if (addingUrl) {
      event.preventDefault();
      addUrl();
    } else {
      const nameInput = document.getElementById("collection-name-input")
      if (nameInput.value == "" || urls.length == 0) {
        event.preventDefault();
        errors = []
        if (nameInput.value == "") {
          errors.push('The field "Name" is mandatory');
        }
        if (urls.length == 0) {
          errors.push('You cannot edit a collection without any URLs');
        }
        alert(`Could not save the new collection due to these erros: ${errors.join('\n')}`);
      } else {
        const currentCollections = await chrome.storage.local.get(["collections"]);
        const cols = currentCollections.collections || [];
        edit_collection.name = nameInput.value;
        edit_collection.color = document.getElementById("collection-color-input").value;
        edit_collection.urls = urls;
        const index = cols.findIndex((col) => col.id == edit_collection.id);
        cols[index] = edit_collection;
        chrome.storage.local.set({ "collections": cols } );
        navigation.back();
      }
    }
  });
}

function loadUrls () {
  urlsArea = document.getElementById("included-urls");
  output = ""
  for (let url of urls) {
    output += `<div class="form-row">
                <span>${maxString(url.string, "url")}</span>
                <button class="icon-button" type="button" id="delete-url-${url.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" class="danger-icon"><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"/></svg>
                </button>
            </div>`
  }
  urlsArea.innerHTML = output;

  for (let url of urls) {
    delete_button = document.getElementById(`delete-url-${url.id}`);
    delete_button.addEventListener("click", () => {
        removeUrl(url);
    });
  }
}

function addUrl () {
  newUrlInput = document.getElementById("new-url");
  urls.push({ string: newUrlInput.value, id: `${edit_collection.id}-${urls.length + 1}` })
  newUrlInput.value = ""
  loadUrls();
}

function removeUrl (url) {
    urls.splice(urls.indexOf(url), 1);
    loadUrls();
}

function maxString (value, type) {
    switch (type) {
        case "url":
            if (value.length > 25) return value.substring(0, 23) + "...";
            return value;
        case "title":
            if (value.length > 17) return value.substring(0, 14) + "...";
            return value;
        default:
            return value;
    }
}