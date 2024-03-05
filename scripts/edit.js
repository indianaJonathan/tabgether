var urls = []
var locale;

window.onload = async () => {
  // Get language from storage
  const result = await chrome.storage.local.get(["language"]);
  const selectedLang = result.language || "en-us";
  // Get locale from file
  locale = await fetch(`../languages/${selectedLang}.json`)
    .then((response) => response.json());

  loadData();
  loadListeners();
  applyLocation();
  applyTheme();
}

function applyLocation() {
  // Get page elements
  const pageTitle = document.getElementById("page-title");
  const colorLabel = document.getElementById("collection-color-label");
  const newUrlInput = document.getElementById("new-url");
  const saveButton = document.getElementById("save-button");
  const backButton = document.getElementById("back");
  const addUrlButton = document.getElementById("add-url-button");

  // Apply locale to elements
  pageTitle.innerHTML = locale.titles.edit_collection;
  colorLabel.innerHTML = `${locale.others.span.color}:`;
  newUrlInput.placeholder = locale.others.placeholders.type_url;
  saveButton.title = locale.buttons.titles.save;
  backButton.title = locale.buttons.titles.back;
  addUrlButton.title = locale.buttons.titles.add_url;
}

async function applyTheme() {
  // Get theme from storage
  const result = await chrome.storage.local.get(["theme"]);
  const theme = result.theme || "dark";

  // Get page elements
  const pageMain = document.getElementById("edit-page");
  const collectionNameInput = document.getElementById("collection-name-input");
  const collectionColorInput = document.getElementById("collection-color-input");
  const newUrlInput = document.getElementById("new-url");
  const urlsArea = document.getElementById("urls-area");
  const back_icon = document.getElementById("back-icon");
  const save_icon = document.getElementById("save-icon");
  const icons = [back_icon]

  // Apply theme on elements
  for (const icon of icons) {
    icon.classList.value = `icon-${theme}`
  }
  pageMain.classList.add(`full-page-${theme}`);
  collectionNameInput.classList.add(`input-${theme}`);
  collectionColorInput.classList.add(`input-color-${theme}`);
  urlsArea.classList.add(`border-${theme}`);
  newUrlInput.classList.add(`input-${theme}`);
  save_icon.classList.add(`icon-dark`);
}

async function loadData() {
  chrome.storage.local.get(["collections"]).then((result) => {
    const collectionId = window.location.search.split("=")[1];
    const col = result.collections.find((col) => col.id == collectionId);
    if (col) {
      const collectionColorInput = document.getElementById("collection-color-input");
      const collectionNameInput = document.getElementById("collection-name-input");

      collectionColorInput.value = col.color;
      collectionNameInput.value = col.name;
      urls = col.urls;
      loadUrls();
    } else {
      navigation.back();
    }
  });
}

function loadListeners() {
  const add_url_button = document.getElementById("add-url-button");
  add_url_button.addEventListener("click", () => { addUrl() });

  var addingUrl = false;
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
      const nameInput = document.getElementById("collection-name-input");
      const colorInput = document.getElementById("collection-color-input");
      if (nameInput.value == "" || urls.length == 0) {
        event.preventDefault();
        errors = []
        if (nameInput.value == "") {
          errors.push(locale.others.errors.name_field_madatory);
        }
        if (urls.length == 0) {
          errors.push(locale.others.errors.add_collection_without_urls);
        }
        alert(`${locale.others.errors.could_not_save_collection}\n${errors.join('\n')}`);
      } else {
        const currentCollections = await chrome.storage.local.get(["collections"]);
        const cols = currentCollections.collections || [];
        const collectionId = window.location.search.split("=")[1];
        const index = cols.findIndex((col) => col.id == collectionId);
        const collection = {
          name: nameInput.value,
          color: colorInput.value,
          urls: cols[index].urls.map((url) => {
            const updatedUrlInput = document.getElementById(`url-edit-input-${url.id}`);
            return {
              ...url,
              string: url.string !== updatedUrlInput.value && validateUrl(updatedUrlInput.value) ? updatedUrlInput.value : url.string,
            }
          }),
        }

        cols[index] = collection;
        chrome.storage.local.set({ "collections": cols });
        navigation.back();
      }
    }
  });
}

function validateUrl(url) {
  if (url === "") return false;
  if (!url.startsWith("https://") && !url.startsWith("http://")) return false;
  return true;
}

function loadUrls() {
  let theme = "dark";
  chrome.storage.local.get(["theme"]).then((result) => {
    theme = result.theme;
  });
  const urlsArea = document.getElementById("included-urls");

  urlsArea.innerHTML = urls.map((url, index) => {
    return UrlComponent(url, theme, index === 0, index === urls.length - 1);
  }).join("");

  for (const url of urls) {
    const moveUpButton = document.getElementById(`url-move-up-${url.id}`);
    const moveDownButton = document.getElementById(`url-move-down-${url.id}`);
    const deleteButton = document.getElementById(`url-delete-${url.id}`);
    const editButton = document.getElementById(`url-edit-${url.id}`);
    const label = document.getElementById(`url-display-${url.id}`);
    const input = document.getElementById(`url-edit-input-${url.id}`);

    deleteButton.addEventListener("click", () => {
      removeUrl(url);
    });
    editButton.addEventListener("click", () => {
      label.style.display = "none";
      input.style.display = "block";
      editButton.style.display = "none";
    });
    if (moveUpButton) moveUpButton.addEventListener("click", () => {
      moveUrl("up", url);
    });
    if (moveDownButton) moveDownButton.addEventListener("click", () => {
      moveUrl("down", url);
    });
    const optionsButton = document.getElementById(`options-url-${url.id}`);
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

function addUrl() {
  newUrlInput = document.getElementById("new-url");
  urls.push({ string: newUrlInput.value, id: `${edit_collection.id}-${urls.length + 1}` })
  newUrlInput.value = ""
  loadUrls();
}

function removeUrl(url) {
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

function maxString(value, type) {
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

function MenuOptionComponent(value, title, id) {
  return `
    <button id="${id}" type="button" class="default-button" title="${title}">
      <span>${value}</span>
    </button>
  `
}

function UrlComponent(url, theme, isFirst, isLast) {
  const options = ["edit", "delete"];
  if (!isFirst) options.push("move-up");
  if (!isLast) options.push("move-down");

  return `
    <div class="form-row">
      <span style="display: block; padding: .3rem 2rem .3rem .3rem; font-size: 1.3rem;" id="url-display-${url.id}">
        ${maxString(url.string, "url")}
      </span>
      <input style="display: none;" id="url-edit-input-${url.id}" type="text" value="${url.string}" class="input-${theme}"/>
      <div class="url-buttons">
        <button class="icon-button" type="button" id="options-url-${url.id}" title="${locale.buttons.titles.url_options}">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 128 512" class="icon-${theme}"><path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"/></svg>
        </button>
        <div class="float-menu-hide" id="url-op-${url.id}">
        ${options.map((option) => {
    return MenuOptionComponent(locale.buttons.captions[option], locale.buttons.titles[`${option}_url`], `url-${option}-${url.id}`)
  }).join("")}
        </div>
      </div>
    </div>
  `
}