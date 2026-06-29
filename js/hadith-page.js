// Renders the full Motivation Wall list. Separate file because MV3 extension
// pages block inline <script>.
var list = document.getElementById("hadithList");
(hadiths || []).forEach(function (h) {
  var card = document.createElement("div");
  card.className = "hw-card";
  card.innerHTML =
    '<div class="h-arabic">' + (h.arabic || "") + "</div>" +
    '<div class="h-english">' + (h.english || "") + "</div>" +
    '<div class="h-ref">' + hadithRefToLinks(h.reference || "") + "</div>";
  list.appendChild(card);
});
