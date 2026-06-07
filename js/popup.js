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
}

var nextEl = qs("#popup-next");

function startPopupTimer() {
  var minutes = Math.floor(Math.random() * 11) + 5;
  if (nextEl) {
    nextEl.textContent = "New dhikr in " + minutes + " min (while popup stays open)";
  }
  setTimeout(function () {
    renderDhikr();
    startPopupTimer();
  }, minutes * 60 * 1000);
}

renderDhikr();
startPopupTimer();