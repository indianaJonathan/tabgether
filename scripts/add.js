var add_collection = {id: "", name: "", color: "", urls: []}
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
  chrome.storage.local.get(["theme"]).then((result) => {
    pageMain = document.getElementById("add-page");
    pageTitle = document.getElementById("page-title");
    collectionNameInput = document.getElementById("collection-name-input");
    collectionColorLabel = document.getElementById("collection-color-label");
    collectionColorInput = document.getElementById("collection-color-input");
    newUrlInput = document.getElementById("new-url");
    urlsArea = document.getElementById("urls-area");
    back_icon = document.getElementById("back-icon");
    save_icon = document.getElementById("save-icon");
    saveButton = document.getElementById("save-button");
    icons = [back_icon]
    for (icon of icons) {
        icon.classList.value = `icon-${result.theme}`
    }
    pageMain.classList.add(`full-page-${result.theme}`);
    pageTitle.innerHTML = lang.titles.add_collection;
    collectionNameInput.classList.add(`input-${result.theme}`)
    collectionNameInput.placeholder = lang.others.placeholders.collection_name;
    collectionColorLabel.innerHTML = lang.others.span.color;
    collectionColorInput.classList.add(`input-color-${result.theme}`)
    urlsArea.classList.add(`border-${result.theme}`)
    newUrlInput.classList.add(`input-${result.theme}`)
    newUrlInput.placeholder = lang.others.placeholders.type_url;
    save_icon.classList.add(`icon-dark`)
    saveButton.title = lang.buttons.titles.save;

    collectionColorInput.value = (getRandomColor());
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
  const collection_form = document.getElementById("add-new-collection-form");
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
          errors.push('You cannot add a collection without any URLs');
        }
        alert(`Could not save the new collection due to these erros: ${errors.join('\n')}`);
      } else {
        const currentCollections = await chrome.storage.local.get(["collections"]);
        const cols = currentCollections.collections || [];
        var available = false;
        newId = 0
        while (!available) {
          const collec = cols.find((c) => c.id.toString() == newId.toString())
          if (!collec) {
            available = true;
          } else {
            newId += 1;
          }
        }
        add_collection.id = `${newId}`;
        add_collection.name = nameInput.value;
        add_collection.color = document.getElementById("collection-color-input").value;
        fixedUrls = [];
        for (let url of urls) {
          newUrl = {string: "", id: ""}
          newUrl.string = url.string;
          newUrl.id = `${newId}-${fixedUrls.length + 1}`
          fixedUrls.push(newUrl);
        }
        add_collection.urls = fixedUrls;
        cols.push(add_collection);
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
    output += `<span>${url.string}</span>`
  }
  urlsArea.innerHTML = output;
}

function addUrl () {
  newUrlInput = document.getElementById("new-url");
  urls.push({string: newUrlInput.value})
  newUrlInput.value = ""
  loadUrls();
}

function getRandomColor () {
  const colors = ["#C66750", "#5CA758", "#B2B059", "#5D80B5"];
  var color = colors[Math.floor(Math.random()*colors.length)];
  return color;
}