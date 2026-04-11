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

  var mapping = getPrayerMapping();
  var highlight = getHighlightPrayer();
  var isSunriseActive = isWithinSunriseWindow();

  grid.innerHTML = "";

  mapping.forEach(function (item) {
    var t = resolvePrayerTime(item.key);

    var col = document.createElement("div");
    col.className = "prayer-col";
    if (highlight && highlight.key === item.key) {
      col.classList.add("is-next");
    }
    if (item.key === "Sunrise" && isSunriseActive) {
      col.classList.add("is-sunrise-warning");
    }

    var name = document.createElement("div");
    name.className = "pc-name";
    name.textContent = item.label;

    var time = document.createElement("div");
    time.className = "pc-time";
    time.textContent = t ? formatTime(t) : "--";

    col.appendChild(name);
    col.appendChild(time);

    if (highlight && highlight.key === item.key && highlight.remainingText) {
      var remaining = document.createElement("div");
      remaining.className = "pc-remaining";
      remaining.textContent = highlight.remainingText;
      col.appendChild(remaining);
    }

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

function getPrayerMapping() {
  return [
    { key: "Fajr", label: "Fajr" },
    { key: "Sunrise", label: "Sunrise" },
    { key: "Dhuhr", label: "Dhuhr" },
    { key: "Asr", label: "Asr" },
    { key: "Maghrib", label: "Maghrib/Iftar" },
    { key: "Isha", label: "Isha" },
    { key: "Suhoor", label: "Suhoor" }
  ];
}

function resolvePrayerTime(key) {
  if (!state.timings) return null;
  if (key === "Suhoor") {
    return state.timings.Fajr;
  }
  return state.timings[key];
}

function getNextPrayer(mapping) {
  if (!state.timings) return null;
  var now = new Date();

  for (var i = 0; i < mapping.length; i++) {
    var t = resolvePrayerTime(mapping[i].key);
    if (!t) continue;
    var parts = t.split(":");
    var dt = new Date();
    dt.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    if (now < dt) {
      return {
        key: mapping[i].key,
        time: t,
        remainingText: formatRemaining(dt, now)
      };
    }
  }

  var fallbackTime = resolvePrayerTime("Fajr");
  if (!fallbackTime) return null;
  var nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);
  var nextParts = fallbackTime.split(":");
  nextDate.setHours(
    parseInt(nextParts[0], 10),
    parseInt(nextParts[1], 10),
    0,
    0
  );

  return {
    key: "Fajr",
    time: fallbackTime,
    remainingText: formatRemaining(nextDate, now)
  };
}

function formatRemaining(target, now) {
  var diff = Math.max(0, target.getTime() - now.getTime());
  var totalSeconds = Math.floor(diff / 1000);
  var hours = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds % 3600) / 60);
  var seconds = totalSeconds % 60;
  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

setInterval(function () {
  if (!state.timings) return;
  renderPrayerGrid();
}, 1000);

function getHighlightPrayer() {
  if (!state.timings) return null;

  var now = new Date();
  var order = [
    "Fajr",
    "Sunrise",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha"
  ];

  var next = null;
  for (var i = 0; i < order.length; i++) {
    var t = resolvePrayerTime(order[i]);
    if (!t) continue;
    var parts = t.split(":");
    var dt = new Date();
    dt.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    if (now < dt) {
      next = { key: order[i], time: t, date: dt };
      break;
    }
  }

  var currentKey = null;
  for (var j = order.length - 1; j >= 0; j--) {
    var ct = resolvePrayerTime(order[j]);
    if (!ct) continue;
    var cparts = ct.split(":");
    var cdt = new Date();
    cdt.setHours(parseInt(cparts[0], 10), parseInt(cparts[1], 10), 0, 0);
    if (now >= cdt) {
      currentKey = order[j];
      break;
    }
  }

  if (!currentKey) {
    currentKey = "Isha";
  }

  if (!next) {
    var fallbackTime = resolvePrayerTime("Fajr");
    var nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    var nextParts = fallbackTime ? fallbackTime.split(":") : ["0", "0"];
    nextDate.setHours(
      parseInt(nextParts[0], 10),
      parseInt(nextParts[1], 10),
      0,
      0
    );
    next = { key: "Fajr", time: fallbackTime, date: nextDate };
  }

  var diffMinutes = Math.floor(
    (next.date.getTime() - now.getTime()) / 60000
  );

  if (diffMinutes <= 30 && diffMinutes >= 0) {
    return {
      key: next.key,
      remainingText: formatRemaining(next.date, now)
    };
  }

  return { key: currentKey, remainingText: "" };
}

function isWithinSunriseWindow() {
  var sunrise = resolvePrayerTime("Sunrise");
  if (!sunrise) return false;
  var parts = sunrise.split(":");
  var start = new Date();
  start.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
  var end = new Date(start.getTime() + 15 * 60 * 1000);
  var now = new Date();
  return now >= start && now <= end;
}
