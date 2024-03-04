var urls = [];
var locale;

window.onload = async () => {
  // Get language from storage
  const result = await chrome.storage.local.get(["language"]);
  const selectedLang = result.language || "en-us";
  // Get locale from file
  locale = await fetch(`../languages/${selectedLang}.json`)
    .then((response) => response.json());

  applyLocation();
  applyTheme();
  loadListeners();
}

async function applyLocation() {
  // Get elements to load data
  const pageTitle = document.getElementById("page-title");
  const collectionNameInput = document.getElementById("collection-name-input");
  const collectionColorLabel = document.getElementById("collection-color-label");
  const collectionColorInput = document.getElementById("collection-color-input");
  const newUrlInput = document.getElementById("new-url");
  const saveButton = document.getElementById("save-button");

  // Load data inner elements
  pageTitle.innerHTML = locale.titles.add_collection;
  collectionNameInput.placeholder = locale.others.placeholders.collection_name;
  collectionColorLabel.innerHTML = locale.others.span.color;
  newUrlInput.placeholder = locale.others.placeholders.type_url;
  saveButton.title = locale.buttons.titles.save;

  collectionColorInput.value = (getRandomColor());
}

async function applyTheme() {
  // Get theme from storage
  const result = chrome.storage.local.get(["theme"]);
  const theme = result.theme || "dark";

  // Get elements to apply theme
  const pageMain = document.getElementById("add-page");
  const collectionNameInput = document.getElementById("collection-name-input");
  const collectionColorInput = document.getElementById("collection-color-input");
  const urlsArea = document.getElementById("urls-area");
  const newUrlInput = document.getElementById("new-url");
  const backIcon = document.getElementById("back-icon");
  const saveIcon = document.getElementById("save-icon");
  const icons = [backIcon]

  // Apply the theme to the elements
  pageMain.classList.add(`full-page-${theme}`);
  collectionNameInput.classList.add(`input-${theme}`);
  collectionColorInput.classList.add(`input-color-${theme}`);
  urlsArea.classList.add(`border-${theme}`);
  newUrlInput.classList.add(`input-${theme}`)
  for (const icon of icons) {
    icon.classList.value = `icon-${theme}`
  }
  saveIcon.classList.add(`icon-dark`)
}

function loadListeners() {
  var addingUrl = false;

  const add_url_button = document.getElementById("add-url-button");
  add_url_button.addEventListener("click", () => addUrl);

  const newUrlInput = document.getElementById("new-url");
  newUrlInput.addEventListener("focus", () => {
    addingUrl = true;
  });
  newUrlInput.addEventListener("blur", () => {
    addingUrl = false;
  });

  const collection_form = document.getElementById("add-new-collection-form");
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
          errors.push(locale.others.errors.name_field_mandatory);
        }
        if (urls.length == 0) {
          errors.push(locale.others.errors.add_collection_without_urls);
        }
        alert(`${locale.others.errors.could_not_save_collection} \n${errors.join('\n')}`);
      } else {
        const newCollection = {
          id: crypto.randomUUID(),
          name: nameInput.value,
          color: colorInput.value,
          urls: urls.map((url) => {
            return {
              id: crypto.randomUUID(),
              string: url.string,
            }
          }),
        }
        const result = await chrome.storage.local.get(["collections"]);
        const collections = result.collections || [];
        collections.push(newCollection);
        chrome.storage.local.set({ "collections": collections });
        navigation.back();
      }
    }
  });
}

function loadUrls() {
  const urlsArea = document.getElementById("included-urls");
  urlsArea.innerHTML = urls.map((url) => {
    return UrlElement(url);
  }).join("");
}

function UrlElement(url) {
  return `<span>${url.string}</span>`
}

function addUrl() {
  const newUrlInput = document.getElementById("new-url");
  if (!validateUrl(newUrlInput.value)) {
    alert(locale.others.errors.invalid_url);
    return;
  }
  urls.push({ string: newUrlInput.value })
  newUrlInput.value = ""
  loadUrls();
}

function getRandomColor() {
  const colors = ["#C66750", "#5CA758", "#B2B059", "#5D80B5"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return color;
}

function validateUrl(url) {
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return false;
  }
  if (url === "") {
    return false;
  }

  return true;
}