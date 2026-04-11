function ptById(id) {
  return document.getElementById(id);
}

function ptSetText(id, text) {
  var el = ptById(id);
  if (el) {
    el.textContent = text;
  }
}

function ptSetHtml(id, html) {
  var el = ptById(id);
  if (el) {
    el.innerHTML = html;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  var parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  var hours = parseInt(parts[0], 10);
  var minutes = parseInt(parts[1], 10);
  var ampm = hours >= 12 ? "PM" : "AM";
  var h12 = hours % 12 || 12;
  return h12 + ":" + String(minutes).padStart(2, "0") + " " + ampm;
}

var prayerCities = [
  { nameBn: "ঢাকা", nameEn: "Dhaka", lat: 23.8103, lon: 90.4125 },
  { nameBn: "চট্টগ্রাম", nameEn: "Chattogram", lat: 22.3569, lon: 91.7832 },
  { nameBn: "খুলনা", nameEn: "Khulna", lat: 22.8456, lon: 89.5403 },
  { nameBn: "রাজশাহী", nameEn: "Rajshahi", lat: 24.3636, lon: 88.6241 },
  { nameBn: "সিলেট", nameEn: "Sylhet", lat: 24.8949, lon: 91.8687 },
  { nameBn: "বরিশাল", nameEn: "Barishal", lat: 22.7010, lon: 90.3535 },
  { nameBn: "রংপুর", nameEn: "Rangpur", lat: 25.7439, lon: 89.2752 },
  { nameBn: "ময়মনসিংহ", nameEn: "Mymensingh", lat: 24.7471, lon: 90.4203 }
];

var methodToId = {
  MuslimWorldLeague: 3,
  Karachi: 1,
  Egyptian: 5,
  UmmAlQura: 4,
  Dubai: 8,
  NorthAmerica: 2,
  Kuwait: 9,
  Qatar: 10,
  Singapore: 11,
  Turkey: 13
};

var state = {
  city: prayerCities[0],
  method: "MuslimWorldLeague",
  timings: null,
  hijri: null
};

function updateDates() {
  if (state.hijri) {
    var hijriText =
      state.hijri.day +
      " " +
      state.hijri.month.en +
      " " +
      state.hijri.year +
      " AH";
    ptSetText("prayerDateHijri", hijriText);
  }
}

function renderPrayerGrid() {
  if (!state.timings) return;

  var grid = ptById("prayerTimesList");
  if (!grid) return;

  var mapping = [
    { key: "Fajr", label: "Fajr" },
    { key: "Sunrise", label: "Sunrise" },
    { key: "Dhuhr", label: "Dhuhr" },
    { key: "Asr", label: "Asr" },
    { key: "Maghrib", label: "Maghrib/Iftar" },
    { key: "Isha", label: "Isha" },
    { key: "Suhoor", label: "Suhoor" }
  ];

  grid.innerHTML = "";

  mapping.forEach(function (item) {
    var t = state.timings[item.key];
    if (item.key === "Suhoor") {
      t = state.timings.Fajr;
    }

    var col = document.createElement("div");
    col.className = "prayer-col";

    var name = document.createElement("div");
    name.className = "pc-name";
    name.textContent = item.label;

    var time = document.createElement("div");
    time.className = "pc-time";
    time.textContent = t ? formatTime(t) : "--";

    col.appendChild(name);
    col.appendChild(time);
    grid.appendChild(col);
  });
}

function updateCityInput() {
  var input = ptById("citySearchInput");
  if (!input) return;
  input.value = state.city.nameBn + " (" + state.city.nameEn + ")";
}

function renderCityDropdown(filter) {
  var dropdown = ptById("cityDropdown");
  if (!dropdown) return;
  dropdown.innerHTML = "";
  var query = (filter || "").trim().toLowerCase();
  var matches = prayerCities.filter(function (c) {
    return (
      c.nameBn.toLowerCase().indexOf(query) !== -1 ||
      c.nameEn.toLowerCase().indexOf(query) !== -1
    );
  });

  if (matches.length === 0) {
    var none = document.createElement("div");
    none.className = "city-no-result";
    none.textContent = "No results";
    dropdown.appendChild(none);
    return;
  }

  matches.forEach(function (city) {
    var opt = document.createElement("div");
    opt.className = "city-opt";
    opt.textContent = city.nameBn;

    var en = document.createElement("span");
    en.className = "city-en";
    en.textContent = city.nameEn;
    opt.appendChild(en);

    opt.addEventListener("click", function () {
      state.city = city;
      chrome.storage.sync.set({ prayerCity: city }, function () {});
      updateCityInput();
      hideCityDropdown();
      fetchPrayerTimes();
    });

    dropdown.appendChild(opt);
  });
}

function showCityDropdown() {
  var dropdown = ptById("cityDropdown");
  if (dropdown) dropdown.classList.add("show");
}

function hideCityDropdown() {
  var dropdown = ptById("cityDropdown");
  if (dropdown) dropdown.classList.remove("show");
}

function bindCitySearch() {
  var input = ptById("citySearchInput");
  if (!input) return;

  input.addEventListener("click", function () {
    showCityDropdown();
    renderCityDropdown("");
  });

  input.addEventListener("input", function () {
    renderCityDropdown(input.value);
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest("#citySearchWrap")) {
      hideCityDropdown();
    }
  });
}

function bindMethodSelect() {
  var select = ptById("prayerMethodSelect");
  if (!select) return;

  select.value = state.method;
  select.addEventListener("change", function () {
    state.method = select.value;
    chrome.storage.sync.set({ prayerMethod: state.method }, function () {});
    fetchPrayerTimes();
  });
}

function bindGps() {
  var btn = ptById("gpsBtn");
  if (!btn) return;

  btn.addEventListener("click", function () {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        state.city = {
          nameBn: "My Location",
          nameEn: "My Location",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        chrome.storage.sync.set({ prayerCity: state.city }, function () {});
        updateCityInput();
        fetchPrayerTimes();
      },
      function () {}
    );
  });
}

function fetchPrayerTimes() {
  var methodId = methodToId[state.method] || 3;
  var url =
    "https://api.aladhan.com/v1/timings?latitude=" +
    state.city.lat +
    "&longitude=" +
    state.city.lon +
    "&method=" +
    methodId;

  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data || !data.data || !data.data.timings) {
        return;
      }
      state.timings = data.data.timings;
      state.hijri = data.data.date ? data.data.date.hijri : null;
      if (state.hijri) {
        window.dispatchEvent(
          new CustomEvent("hijriUpdated", { detail: state.hijri })
        );
      }
      updateDates();
      renderPrayerGrid();
    })
    .catch(function () {});
}

chrome.storage.sync.get(["prayerCity", "prayerMethod"], function (result) {
  if (result.prayerCity && result.prayerCity.lat && result.prayerCity.lon) {
    state.city = result.prayerCity;
  }
  if (result.prayerMethod && methodToId[result.prayerMethod]) {
    state.method = result.prayerMethod;
  }
  updateCityInput();
  updateDates();
  bindCitySearch();
  bindMethodSelect();
  bindGps();
  fetchPrayerTimes();
});
