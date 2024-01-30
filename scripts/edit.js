var edit_collection = {id: "", name: "", color: "", urls: []}
var urls = []
var lang;

window.onload = () => {
  getLocation();
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
        loadData();
        loadListeners();
  });
}

function loadData () {
  let theme = "dark";
  chrome.storage.local.get(["theme"]).then((result) => {
    theme = result.theme;
    pageMain = document.getElementById("edit-page");
    pageTitle = document.getElementById("page-title");
    collectionNameInput = document.getElementById("collection-name-input")
    collectionColorInput = document.getElementById("collection-color-input")
    colorLabel = document.getElementById("collection-color-label")
    newUrlInput = document.getElementById("new-url")
    urlsArea = document.getElementById("urls-area")
    back_icon = document.getElementById("back-icon")
    backButton = document.getElementById("back")
    save_icon = document.getElementById("save-icon")
    saveButton = document.getElementById("save-button")
    addUrlButton = document.getElementById("add-url-button")
    icons = [back_icon]
    for (icon of icons) {
        icon.classList.value = `icon-${theme}`
    }
    pageMain.classList.add(`full-page-${theme}`);
    pageTitle.innerHTML = lang.titles.edit_collection;
    collectionNameInput.classList.add(`input-${theme}`)
    collectionColorInput.classList.add(`input-color-${theme}`)
    colorLabel.innerHTML = `${lang.others.span.color}:`;
    urlsArea.classList.add(`border-${theme}`)
    newUrlInput.classList.add(`input-${theme}`)
    newUrlInput.placeholder = lang.others.placeholders.type_url;
    save_icon.classList.add(`icon-dark`)
    saveButton.title = lang.buttons.titles.save;
    backButton.title = lang.buttons.titles.back;
    addUrlButton = lang.buttons.titles.add_url;
  });

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
        navigation.back();
    }
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
        for (let url of urls) {
          const updatedUrlInput = document.getElementById(`url-edit-input-${url.id}`)
          if (url.string != updatedUrlInput.value && updatedUrlInput.value != "") {
            url.string = updatedUrlInput.value;
          }
        }
        cols[index] = edit_collection;
        chrome.storage.local.set({ "collections": cols } );
        navigation.back();
      }
    }
  });
}

function loadUrls () {
  let theme = "dark";
  chrome.storage.local.get(["theme"]).then((result) => {
    theme = result.theme;
  });
  urlsArea = document.getElementById("included-urls");
  output = ""
  for (let url of urls) {
    output += `<div class="form-row">
                <span style="display: block; padding: .3rem 2rem .3rem .3rem; font-size: 1.3rem;" id="url-display-${url.id}">${maxString(url.string, "url")}</span>
                <input style="display: none;" id="url-edit-input-${url.id}" type="text" value="${url.string}" class="input-${theme}"/>
                <div class="url-buttons">
                  <button class="icon-button" type="button" id="options-url-${url.id}" title="${lang.buttons.titles.url_options}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 128 512" class="icon-${theme}"><path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"/></svg>
                  </button>
                  <div class="float-menu-hide" id="url-op-${url.id}">
                      <button id="url-edit-${url.id}" type="button" class="default-button" title="${lang.buttons.titles.edit_url}">
                          <span>${lang.buttons.captions.edit}</span>
                      </button>
                      <button id="url-move-up-${url.id}" type="button" class="default-button" title="${lang.buttons.titles.move_url_up}">
                          <span>${lang.buttons.captions.move_up}</span>
                      </button>
                      <button id="url-move-down-${url.id}" type="button" class="default-button" title="${lang.buttons.titles.move_url_down}">
                          <span>${lang.buttons.captions.move_down}</span>
                      </button>
                      <button id="url-delete-${url.id}" type="button" class="default-button" title="${lang.buttons.titles.delete_url}">
                          <span>${lang.buttons.captions.delete}</span>
                      </button>
                  </div>
                </div>
            </div>`
  }
  urlsArea.innerHTML = output;

  for (let url of urls) {
    const moveUpButton = document.getElementById(`url-move-up-${url.id}`);
    const moveDownButton = document.getElementById(`url-move-down-${url.id}`);
    const delete_button = document.getElementById(`url-delete-${url.id}`);
    const edit_button = document.getElementById(`url-edit-${url.id}`);
    const label = document.getElementById(`url-display-${url.id}`);
    const input = document.getElementById(`url-edit-input-${url.id}`);
    if (urls.indexOf(url) == 0) {
      moveUpButton.style.display = "none";
    } else if (urls.indexOf(url) == urls.length - 1) {
      moveDownButton.style.display = "none";
    }
    delete_button.addEventListener("click", () => {
        removeUrl(url);
    });
    edit_button.addEventListener("click", () => {
      label.style.display = "none";
      input.style.display = "block";
      edit_button.style.display = "none";
    });
    moveUpButton.addEventListener("click", () => {
      moveUrl("up", url);
    });
    moveDownButton.addEventListener("click", () => {
      moveUrl("down", url);
    });
    optionsButton = document.getElementById(`options-url-${url.id}`);
    optionsButton.addEventListener("click", () => {
      menu = document.getElementById(`url-op-${url.id}`);
      if (menu.classList.value.includes("float-menu-hide")) {
        menu.classList.remove("float-menu-hide");
        menu.classList.add(`float-menu-${theme}`);
      } else {
        menu.classList.remove(`float-menu-${theme}`);
        menu.classList.add("float-menu-hide");
      }
    });
    document.addEventListener("click", (event) => {
      menu = document.getElementById(`url-op-${url.id}`);
      if (menu) {
        if (event.target.id != `url-op-${url.id}` && event.target.parentElement.id != `options-url-${url.id}` && event.target.parentElement.id != `url-op-${url.id}`) {
          menu.classList.remove(`float-menu-${theme}`);
          menu.classList.add("float-menu-hide");
        }
      }
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

function moveUrl(direction, url) {
  if (direction === "up") {
    const index = urls.indexOf(url);
    const prevUrl = urls[index - 1];
    urls[index - 1] = url;
    urls[index] = prevUrl;
  } else {
    const index = urls.indexOf(url);
    const nextUrl = urls[index + 1];
    urls[index + 1] = url;
    urls[index] = nextUrl;
  }
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