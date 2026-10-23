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

// Default until the user picks a city.
var defaultCity = { nameEn: "Dhaka, Dhaka Division, Bangladesh", lat: 23.8103, lon: 90.4125, tz: "Asia/Dhaka" };

// PrayTimes (praytimes.org) calculation params per method.
// base = a PrayTimes built-in to seed from; params = overrides (fajr/isha angles
// or "N min"). Covers methods PrayTimes lacks built-ins for (Dubai/Kuwait/etc).
var methodParams = {
  MuslimWorldLeague: { base: "MWL" },
  Karachi: { base: "Karachi" },
  Egyptian: { base: "Egypt" },
  UmmAlQura: { base: "Makkah" },
  NorthAmerica: { base: "ISNA" },
  Dubai: { base: "MWL", params: { fajr: 18.2, isha: 18.2 } },
  Kuwait: { base: "MWL", params: { fajr: 18, isha: 17.5 } },
  Qatar: { base: "MWL", params: { fajr: 18, isha: "90 min" } },
  Singapore: { base: "MWL", params: { fajr: 20, isha: 18 } },
  Turkey: { base: "MWL", params: { fajr: 18, isha: 17 } }
};

var monthNamesHijri = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Shaban",
  "Ramadan", "Shawwal", "Dhul-Qadah", "Dhul-Hijjah"
];

// Hijri date from the browser's built-in Umm al-Qura calendar (no network).
function getHijriDate(date) {
  var parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric"
  }).formatToParts(date);
  var map = {};
  parts.forEach(function (p) {
    map[p.type] = p.value;
  });
  var monthNum = parseInt(map.month, 10);
  return {
    day: map.day,
    month: { number: monthNum, en: monthNamesHijri[monthNum - 1] || map.month },
    year: parseInt(map.year, 10)
  };
}

var state = {
  city: defaultCity,
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

function updateCityLabel() {
  var label = ptById("cityLabel");
  if (!label) return;
  label.textContent = state.city.nameEn;
}

function setCity(city) { // city.tz absent (GPS) = browser timezone
  state.city = city;
  chrome.storage.sync.set({ prayerCity: city }, function () {});
  updateCityLabel();
  fetchPrayerTimes();
}

function bindCitySearch() {
  var input = ptById("citySearchInput");
  var dropdown = ptById("cityDropdown");
  if (!input || !dropdown) return;

  // GeoNames cities15000 (CC-BY), loaded once on first focus.
  var world = null;
  function load() {
    if (world) return;
    world = [];
    fetch("data/cities.json")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        world = d.cities.map(function (r) {
          var place = r[1] ? r[1] + ", " : "";
          return {
            nameEn: r[0] + ", " + place + d.countries[r[2]],
            lat: r[3],
            lon: r[4],
            tz: d.timezones[r[5]]
          };
        });
        render();
      })
      .catch(function () { world = []; });
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    dropdown.innerHTML = "";
    var matches = (world || [])
      .filter(function (c) {
        return c.nameEn.toLowerCase().indexOf(q) !== -1;
      })
      .sort(function (a, b) { // names starting with the query first; stable, so biggest city wins
        return (b.nameEn.toLowerCase().indexOf(q) === 0) - (a.nameEn.toLowerCase().indexOf(q) === 0);
      })
      .slice(0, 50); // ponytail: first 50 hits, type more to narrow
    if (!matches.length) {
      var none = document.createElement("div");
      none.className = "city-no-result";
      none.textContent = "No results";
      dropdown.appendChild(none);
    }
    matches.forEach(function (c) {
      var opt = document.createElement("div");
      opt.className = "city-opt";
      opt.textContent = c.nameEn;
      opt.addEventListener("click", function () {
        input.value = "";
        dropdown.classList.remove("show");
        setCity(c);
      });
      dropdown.appendChild(opt);
    });
    dropdown.classList.add("show");
  }

  input.addEventListener("focus", function () { load(); render(); });
  input.addEventListener("input", render);
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#citySearchWrap")) dropdown.classList.remove("show");
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
        setCity({
          nameEn: "My Location",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
      },
      function () {}
    );
  });
}

// Wall-clock "now" in the selected city's timezone, as a Date whose local
// fields read that time. No tz (GPS) = the browser's own, which is right there.
function cityNow() {
  var tz = state.city && state.city.tz;
  return tz ? new Date(new Date().toLocaleString("en-US", { timeZone: tz })) : new Date();
}

function fetchPrayerTimes() {
  var cfg = methodParams[state.method] || methodParams.MuslimWorldLeague;
  var pt = new PrayTimes(cfg.base);
  if (cfg.params) {
    pt.adjust(cfg.params);
  }

  var now = new Date();
  var local = cityNow();
  // City UTC offset in hours (DST included), rounded to the quarter hour.
  var offset = Math.round(((local - now) / 3600000 - now.getTimezoneOffset() / 60) * 4) / 4;
  var times = pt.getTimes(local, [state.city.lat, state.city.lon], offset, 0);

  state.timings = {
    Fajr: times.fajr,
    Sunrise: times.sunrise,
    Dhuhr: times.dhuhr,
    Asr: times.asr,
    Maghrib: times.maghrib,
    Isha: times.isha
  };
  state.hijri = getHijriDate(now);
  window.dispatchEvent(
    new CustomEvent("hijriUpdated", { detail: state.hijri })
  );
  updateDates();
  renderPrayerGrid();
}

chrome.storage.sync.get(["prayerCity", "prayerMethod"], function (result) {
  if (result.prayerCity && result.prayerCity.lat && result.prayerCity.lon) {
    state.city = result.prayerCity;
  }
  if (result.prayerMethod && methodParams[result.prayerMethod]) {
    state.method = result.prayerMethod;
  }
  updateCityLabel();
  updateDates();
  bindMethodSelect();
  bindCitySearch();
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
  var now = cityNow();

  for (var i = 0; i < mapping.length; i++) {
    var t = resolvePrayerTime(mapping[i].key);
    if (!t) continue;
    var parts = t.split(":");
    var dt = cityNow();
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
  var nextDate = cityNow();
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

  var now = cityNow();
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
    var dt = cityNow();
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
    var cdt = cityNow();
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
    var nextDate = cityNow();
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
  var start = cityNow();
  start.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
  var end = new Date(start.getTime() + 15 * 60 * 1000);
  var now = cityNow();
  return now >= start && now <= end;
}
