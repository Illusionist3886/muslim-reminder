var dhikrId = Math.floor(Math.random() * dhikrs.length);

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return Array.prototype.slice.call(document.querySelectorAll(selector));
}

function setHtml(selector, html) {
  var el = qs(selector);
  if (el) {
    el.innerHTML = html;
  }
}

function safeText(value) {
  return value == null ? "" : String(value);
}

function getFaviconUrl(rawUrl) {
  try {
    var url = new URL(rawUrl);
    return "https://www.google.com/s2/favicons?domain=" + url.hostname + "&sz=64";
  } catch (e) {
    return "";
  }
}

function normalizeRef(ref) {
  return safeText(ref)
    .replace(/\s+/g, " ")
    .replace(/;+/g, ";")
    .trim();
}

function refToLinks(ref) {
  var text = normalizeRef(ref);
  if (!text) {
    return "";
  }

  var parts = text.split(";").map(function (p) {
    return p.trim();
  });

  var rendered = parts.map(function (part) {
    var m =
      part.match(/Bukhari\s*(No:)?\s*([0-9]+)/i) ||
      part.match(/Muslim\s*(No:)?\s*([0-9]+)/i) ||
      part.match(/Tirmidhi\s*(No:)?\s*([0-9]+)/i) ||
      part.match(/Abu Dawud\s*(No:)?\s*([0-9]+)/i) ||
      part.match(/Ibn Majah\s*(No:)?\s*([0-9]+)/i);

    if (!m) {
      return safeText(part);
    }

    var book = m[0].split(/\s+/)[0].toLowerCase();
    if (book === "abu") {
      book = "abudawud";
    } else if (book === "ibn") {
      book = "ibnmajah";
    }

    var number = m[m.length - 1];
    var url = "https://sunnah.com/" + book + ":" + number;
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + safeText(part) + "</a>";
  });

  return rendered.join("; ");
}

// var notificationData = gtafs[dhikrId];
var notificationData = dhikrs[dhikrId];

// $('.title').html(notificationData.pageTitle)
// $('.top').html(notificationData.details[0].top)
// $('.arabic').html(notificationData.details[0].arabic)
// $('.translation').html(notificationData.details[0].translation)
// $('.bottom').html(notificationData.details[0].bottom)
// $('.reference').html(notificationData.details[0].reference)

setHtml(".title", notificationData.title || "");
// $('.top').html(notificationData.details[0].top)
setHtml(".arabic", notificationData.arabic || "");
setHtml(".translation", notificationData.english || "");
// $('.bottom').html(notificationData.details[0].bottom)
setHtml(".reference", refToLinks(notificationData.reference || ""));

setupRamadanCountdown();
deedsPresent();

function notifyUser() {
  var showNotification = {
    type: "basic",
    iconUrl: "icon/icon48.png",
    title: "dsfdsf",
    message: "Wet your tounge with the remembrance of Allah",
  };

  const d = new Date();
  let time = d.getTime();
  remindDhikr = "dhikr" + time;
  chrome.notifications.create(remindDhikr, showNotification);
}

// https://dua.gtaf.org/api/en/details/260

// Ramadan Reminder
var ramadanTimerId = null;

function setupRamadanCountdown() {
  var countdownBox = qs("#ramadanCountdown");
  if (countdownBox) {
    countdownBox.classList.add("hidden");
  }

  window.addEventListener("hijriUpdated", function (event) {
    var hijri = event.detail;
    if (!hijri || !hijri.month || !hijri.month.number) {
      return;
    }

    var monthNumber = hijri.month.number;
    if (monthNumber === 7 || monthNumber === 8) {
      showRamadanCountdown(hijri.year);
      if (countdownBox) {
        countdownBox.classList.remove("hidden");
      }
    } else if (countdownBox) {
      countdownBox.classList.add("hidden");
    }
  });
}

function showRamadanCountdown(hijriYear) {
  var demoEl = qs("#demo");
  var labelEl = qs("#ramadanLabel");
  if (!demoEl) {
    return;
  }

  if (labelEl) {
    labelEl.textContent = "Days till Ramadan";
  }

  fetch("https://api.aladhan.com/v1/hToG?date=01-09-" + hijriYear)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data || !data.data || !data.data.gregorian || !data.data.gregorian.date) {
        return;
      }

      var gregorianDate = data.data.gregorian.date; // DD-MM-YYYY
      var parts = gregorianDate.split("-");
      if (parts.length !== 3) {
        return;
      }

      var target = new Date(
        parseInt(parts[2], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[0], 10),
        0,
        0,
        0,
        0
      ).getTime();

      if (ramadanTimerId) {
        clearInterval(ramadanTimerId);
      }

      ramadanTimerId = setInterval(function () {
        var now = new Date().getTime();
        var distance = target - now;
        if (distance < 0) {
          demoEl.textContent = "0d 0h 0m 0s";
          return;
        }
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        demoEl.textContent =
          days + "d " + hours + "h " + minutes + "m " + seconds + "s";
      }, 1000);
    })
    .catch(function () {});
}

function deedsPresent() {
  const deedsDate = new Date();
  let deedsDay = deedsDate.getDay();
  if (deedsDay == 1 || deedsDay == 4) {
    var deedsBox = qs("#deedsBox");
    if (deedsBox) {
      deedsBox.classList.remove("hidden");
      deedsBox.classList.add("animate-pulse");
    }
    setHtml("#deeds", "Your deeds will be presented before Allah TODAY");
  }
}

var showBookmarkForm = qs("#showBookmarkForm");
var bookmarkModal = qs("#bookmark-modal");
var bookmarkForm = qs("#bookmark-form");
var deedsBox = qs("#deedsBox");
var addShortcutButton = qs("#addShortcut");
var shortcutNameInput = qs("#shortcutname");
var shortcutIconInput = qs("#shortcuticonurl");
var shortcutUrlInput = qs("#shortcuturl");
var shortcutsEl = qs("#shortcuts");
var shortcutsState = [];
var editingShortcutId = null;
var menuCloseHandlerBound = false;
var defaultShortcuts = [
  {
    id: "default-seerah-gtaf",
    name: "Seerah",
    url: "https://seerah.gtaf.org/",
    locked: true,
  },
  {
    id: "default-quranmazid",
    name: "Quran Mazid",
    url: "https://quranmazid.com/",
    locked: true,
  },
  {
    id: "default-dua-gtaf",
    name: "Dua",
    url: "https://dua.gtaf.org/",
    locked: true,
  },
];

if (showBookmarkForm) {
  showBookmarkForm.addEventListener("click", function () {
    editingShortcutId = null;
    updateShortcutButtonLabel();
    resetShortcutForm();
    if (deedsBox) {
      deedsBox.classList.remove("animate-pulse");
    }
    if (bookmarkModal) {
      bookmarkModal.classList.remove("hidden");
    }
    if (bookmarkForm) {
      bookmarkForm.classList.remove("hidden");
    }
  });
}

function hideModal() {
  if (deedsBox) {
    deedsBox.classList.add("animate-pulse");
  }
  if (bookmarkModal) {
    bookmarkModal.classList.add("hidden");
  }
  if (bookmarkForm) {
    bookmarkForm.classList.add("hidden");
  }
}

if (bookmarkModal) {
  bookmarkModal.addEventListener("click", hideModal);
}
// chrome.storage.sync.remove('bookmarks')

function updateShortcutButtonLabel() {
  if (addShortcutButton) {
    addShortcutButton.textContent = editingShortcutId
      ? "Save Shortcut"
      : "Add Shortcut";
  }
}

function resetShortcutForm() {
  if (shortcutNameInput) shortcutNameInput.value = "";
  if (shortcutIconInput) shortcutIconInput.value = "";
  if (shortcutUrlInput) shortcutUrlInput.value = "";
}

function collectShortcutForm() {
  var urlValue = shortcutUrlInput ? shortcutUrlInput.value.trim() : "";
  var iconValue = shortcutIconInput ? shortcutIconInput.value.trim() : "";
  var nameValue = shortcutNameInput ? shortcutNameInput.value.trim() : "";

  if (!urlValue) {
    return null;
  }

  if (!iconValue) {
    iconValue = getFaviconUrl(urlValue);
  }

  if (!nameValue) {
    try {
      nameValue = new URL(urlValue).hostname;
    } catch (e) {
      nameValue = urlValue;
    }
  }

  return {
    name: nameValue,
    icon: iconValue,
    url: urlValue,
    locked: false,
  };
}

function saveShortcuts() {
  chrome.storage.sync.set({ shortcuts: shortcutsState }, function () {});
}

function normalizeUrl(value) {
  try {
    return new URL(value).toString();
  } catch (e) {
    return safeText(value).trim();
  }
}

function mergeWithDefaultShortcuts(shortcuts) {
  var normalizedDefaultsByUrl = {};
  defaultShortcuts.forEach(function (item) {
    normalizedDefaultsByUrl[normalizeUrl(item.url)] = item;
  });

  var kept = [];
  var seenDefaultIds = {};

  shortcuts.forEach(function (item) {
    var matchedDefault = normalizedDefaultsByUrl[normalizeUrl(item.url)];
    if (matchedDefault) {
      kept.push({
        id: matchedDefault.id,
        name: matchedDefault.name,
        icon: item.icon || getFaviconUrl(matchedDefault.url),
        url: matchedDefault.url,
        locked: true,
      });
      seenDefaultIds[matchedDefault.id] = true;
      return;
    }
    if (defaultShortcuts.some(function (d) { return d.id === item.id; })) {
      return;
    }
    kept.push(item);
  });

  defaultShortcuts.forEach(function (item) {
    if (!seenDefaultIds[item.id]) {
      kept.push({
        id: item.id,
        name: item.name,
        icon: getFaviconUrl(item.url),
        url: item.url,
        locked: true,
      });
    }
  });

  return kept;
}

function openShortcutModal(item) {
  editingShortcutId = item ? item.id : null;
  updateShortcutButtonLabel();

  if (shortcutNameInput) shortcutNameInput.value = item ? item.name || "" : "";
  if (shortcutIconInput) shortcutIconInput.value = item ? item.icon || "" : "";
  if (shortcutUrlInput) shortcutUrlInput.value = item ? item.url || "" : "";

  if (deedsBox) {
    deedsBox.classList.remove("animate-pulse");
  }
  if (bookmarkModal) {
    bookmarkModal.classList.remove("hidden");
  }
  if (bookmarkForm) {
    bookmarkForm.classList.remove("hidden");
  }
}

function renderShortcuts() {
  if (!shortcutsEl) {
    return;
  }

  var existing = qsa(".shortcut-item");
  existing.forEach(function (node) {
    node.remove();
  });

  shortcutsState.forEach(function (item) {
    var node = createShortcutElement(item);
    shortcutsEl.insertBefore(node, showBookmarkForm || null);
  });

  if (!menuCloseHandlerBound) {
    document.addEventListener("click", function () {
      closeAllShortcutMenus();
    });
    menuCloseHandlerBound = true;
  }
}

function createShortcutElement(item) {
  var icon = item.icon || getFaviconUrl(item.url || "");

  var wrapper = document.createElement("div");
  wrapper.className =
    "shortcut-item flex flex-col items-center justify-center";
  wrapper.dataset.id = item.id;

  var link = document.createElement("a");
  link.href = safeText(item.url);
  link.className =
    "w-20 flex items-center flex-col hover:bg-gray-300 transition-all duration-200 ease-linear rounded-md p-2";
  link.target = "_blank";

  var iconWrap = document.createElement("div");
  iconWrap.className = "rounded-full bg-gray-200 h-10 w-10 p-2";

  var img = document.createElement("img");
  img.src = safeText(icon);
  img.alt = "";
  iconWrap.appendChild(img);

  var name = document.createElement("div");
  name.className = "text-center font-bold";
  name.textContent = safeText(item.name);

  link.appendChild(iconWrap);
  link.appendChild(name);

  wrapper.appendChild(link);

  if (item.locked) {
    var fixedDot = document.createElement("span");
    fixedDot.className = "shortcut-fixed-dot";
    fixedDot.title = "Fixed shortcut";
    wrapper.appendChild(fixedDot);
  }

  if (!item.locked) {
    var menuBtn = document.createElement("button");
    menuBtn.type = "button";
    menuBtn.className = "shortcut-menu-btn";
    menuBtn.textContent = "...";
    menuBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleShortcutMenu(wrapper);
    });

    var menu = document.createElement("div");
    menu.className = "shortcut-menu";

    var editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeAllShortcutMenus();
      openShortcutModal(item);
    });

    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeAllShortcutMenus();
      deleteShortcut(item.id);
    });

    menu.appendChild(editBtn);
    menu.appendChild(deleteBtn);

    wrapper.appendChild(menuBtn);
    wrapper.appendChild(menu);
  }

  return wrapper;
}

function closeAllShortcutMenus() {
  qsa(".shortcut-item.is-open").forEach(function (node) {
    node.classList.remove("is-open");
  });
}

function toggleShortcutMenu(wrapper) {
  var isOpen = wrapper.classList.contains("is-open");
  closeAllShortcutMenus();
  if (!isOpen) {
    wrapper.classList.add("is-open");
  }
}

function deleteShortcut(id) {
  shortcutsState = shortcutsState.filter(function (item) {
    return item.id !== id || item.locked;
  });
  saveShortcuts();
  renderShortcuts();
}

if (addShortcutButton) {
  addShortcutButton.addEventListener("click", function () {
    var formData = collectShortcutForm();
    if (!formData) {
      return;
    }

    if (editingShortcutId) {
      shortcutsState = shortcutsState.map(function (item) {
        if (item.id !== editingShortcutId) {
          return item;
        }
        return {
          id: item.id,
          name: formData.name,
          icon: formData.icon,
          url: formData.url,
        };
      });
    } else {
      var newId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now());
      shortcutsState.push({
        id: newId,
        name: formData.name,
        icon: formData.icon,
        url: formData.url,
      });
    }

    saveShortcuts();
    renderShortcuts();
    hideModal();
    resetShortcutForm();
    editingShortcutId = null;
    updateShortcutButtonLabel();
  });
}

// var bookmarks = [{
//                 'name' : 'Google',
//                 'icon'  : 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
//                 'url' : 'https://google.com'

//               },
//               {
//                 'name' : 'Gmail',
//                 'icon'  : 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
//                 'url' : 'https://gmail.com'
//               }
//           ];
chrome.storage.sync.get(["shortcuts", "bookmarks"], function (result) {
  var shortcuts = Array.isArray(result.shortcuts) ? result.shortcuts : null;
  var legacy = Array.isArray(result.bookmarks) ? result.bookmarks : null;

  if (!shortcuts && legacy) {
    shortcuts = legacy;
    chrome.storage.sync.set({ shortcuts: shortcuts }, function () {});
  }

  if (!Array.isArray(shortcuts)) {
    shortcuts = [];
    chrome.storage.sync.set({ shortcuts: shortcuts }, function () {});
  }

  shortcutsState = shortcuts.map(function (item) {
    if (!item.id) {
      item.id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()) + Math.floor(Math.random() * 1000);
    }
    if (!item.icon) {
      item.icon = getFaviconUrl(item.url || "");
    }
    return item;
  });
  shortcutsState = mergeWithDefaultShortcuts(shortcutsState);

  saveShortcuts();
  renderShortcuts();
});
