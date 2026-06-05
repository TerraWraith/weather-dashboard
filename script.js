const form = document.querySelector("#weatherForm");
const cityInput = document.querySelector("#cityInput");
const searchButton = document.querySelector("#searchButton");
const recentList = document.querySelector("#recentList");
const statusMessage = document.querySelector("#statusMessage");

const cityName = document.querySelector("#cityName");
const weatherDescription = document.querySelector("#weatherDescription");
const weatherIcon = document.querySelector("#weatherIcon");
const temperature = document.querySelector("#temperature");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#windSpeed");
const apparentTemperature = document.querySelector("#apparentTemperature");
const updatedAt = document.querySelector("#updatedAt");

const RECENT_KEY = "weather-app-recent-cities";
const MAX_RECENT = 6;

const weatherCodes = [
  { codes: [0], description: "晴朗", icon: "☀", theme: "weather-clear" },
  { codes: [1, 2, 3], description: "多云", icon: "☁", theme: "weather-cloud" },
  { codes: [45, 48], description: "雾", icon: "≋", theme: "weather-fog" },
  { codes: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], description: "降雨", icon: "☔", theme: "weather-rain" },
  { codes: [71, 73, 75, 77, 85, 86], description: "降雪", icon: "❄", theme: "weather-snow" },
  { codes: [95, 96, 99], description: "雷暴", icon: "⚡", theme: "weather-storm" }
];

function getRecentCities() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecentCity(city) {
  const normalized = city.trim();
  const recent = getRecentCities().filter((item) => item.toLowerCase() !== normalized.toLowerCase());
  localStorage.setItem(RECENT_KEY, JSON.stringify([normalized, ...recent].slice(0, MAX_RECENT)));
  renderRecentCities();
}

function renderRecentCities() {
  const recent = getRecentCities();
  recentList.innerHTML = "";

  if (!recent.length) {
    const empty = document.createElement("span");
    empty.textContent = "暂无记录";
    recentList.appendChild(empty);
    return;
  }

  recent.forEach((city) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = city;
    button.addEventListener("click", () => searchWeather(city));
    recentList.appendChild(button);
  });
}

function setLoading(isLoading) {
  searchButton.disabled = isLoading;
  searchButton.classList.toggle("is-loading", isLoading);
  cityInput.disabled = isLoading;
}

function setStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type === "error" ? "error" : ""}`;
}

function getWeatherMeta(code) {
  return weatherCodes.find((item) => item.codes.includes(code)) || {
    description: "未知天气",
    icon: "?",
    theme: "weather-cloud"
  };
}

function applyTheme(theme) {
  document.body.classList.remove("weather-clear", "weather-cloud", "weather-rain", "weather-snow", "weather-storm", "weather-fog");
  document.body.classList.add(theme);
}

function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));
}

async function fetchCityLocation(query) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "zh");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("城市查询服务暂时不可用，请稍后再试。");
  }

  const data = await response.json();
  if (!data.results || !data.results.length) {
    throw new Error("没有找到这个城市，请检查拼写后再试。");
  }

  return data.results[0];
}

async function fetchWeather(location) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", location.latitude);
  url.searchParams.set("longitude", location.longitude);
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("天气服务暂时不可用，请稍后再试。");
  }

  const data = await response.json();
  if (!data.current) {
    throw new Error("没有获得当前天气数据，请换个城市再试。");
  }

  return data.current;
}

function renderWeather(location, current) {
  const meta = getWeatherMeta(current.weather_code);
  const displayName = [location.name, location.admin1, location.country].filter(Boolean).join(" · ");

  cityName.textContent = displayName;
  weatherDescription.textContent = meta.description;
  weatherIcon.textContent = meta.icon;
  temperature.textContent = `${Math.round(current.temperature_2m)}°`;
  humidity.textContent = `${current.relative_humidity_2m}%`;
  windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  apparentTemperature.textContent = `${Math.round(current.apparent_temperature)}°`;
  updatedAt.textContent = formatTime(current.time);
  applyTheme(meta.theme);
}

async function searchWeather(rawCity) {
  const query = rawCity.trim();
  if (!query) {
    setStatus("请输入城市名称。", "error");
    return;
  }

  setLoading(true);
  setStatus("正在获取天气数据...");

  try {
    const location = await fetchCityLocation(query);
    const current = await fetchWeather(location);
    renderWeather(location, current);
    saveRecentCity(location.name);
    setStatus("天气数据已更新。");
    cityInput.value = "";
  } catch (error) {
    setStatus(error.message || "查询失败，请稍后再试。", "error");
  } finally {
    setLoading(false);
    cityInput.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchWeather(cityInput.value);
});

renderRecentCities();
