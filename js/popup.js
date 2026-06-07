function qs(selector) {
  return document.querySelector(selector);
}

function safeText(value) {
  return value == null ? "" : String(value);
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
    return (
      '<a href="' +
      url +
      '" target="_blank" rel="noopener noreferrer">' +
      safeText(part) +
      "</a>"
    );
  });

  return rendered.join("; ");
}

function renderDhikr() {
  if (!Array.isArray(dhikrs) || dhikrs.length === 0) {
    return;
  }

  var dhikrId = Math.floor(Math.random() * dhikrs.length);
  var item = dhikrs[dhikrId] || {};

  var titleEl = qs("#popup-title");
  var arabicEl = qs("#popup-arabic");
  var translationEl = qs("#popup-translation");
  var referenceEl = qs("#popup-reference");

  if (titleEl) titleEl.textContent = safeText(item.title || "");
  if (arabicEl) arabicEl.textContent = safeText(item.arabic || "");
  if (translationEl) translationEl.textContent = safeText(item.english || "");
  if (referenceEl) referenceEl.innerHTML = refToLinks(item.reference || "");

  var nextEl = qs("#popup-next");
  if (nextEl) {
    var minutes = randomInt(5, 15);
    nextEl.textContent = "New dhikr in " + minutes + " min (while popup stays open)";
    startPopupTimer(minutes);
  }
}

var popupTimerId = null;

function startPopupTimer(minutes) {
  if (popupTimerId) {
    clearTimeout(popupTimerId);
  }
  var nextEl = qs("#popup-next");
  popupTimerId = setTimeout(function () {
    renderDhikr();
  }, minutes * 60 * 1000);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

renderDhikr();
scheduleNext();
