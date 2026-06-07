function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return Array.prototype.slice.call(document.querySelectorAll(selector));
}

function safeText(value) {
  return value == null ? "" : String(value);
}

function escapeHtml(str) {
  var el = document.createElement("span");
  el.textContent = str;
  return el.innerHTML;
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
      return escapeHtml(safeText(part));
    }

    var book = m[0].split(/\s+/)[0].toLowerCase();
    if (book === "abu") {
      book = "abudawud";
    } else if (book === "ibn") {
      book = "ibnmajah";
    }

    var number = m[m.length - 1];
    var url = "https://sunnah.com/" + book + ":" + number;
    return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(safeText(part)) + "</a>";
  });

  return rendered.join("; ");
}