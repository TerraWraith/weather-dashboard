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
  { codes: [0], description: "Clear", icon: "☀", theme: "weather-clear" },
  { codes: [1, 2, 3], description: "Cloudy", icon: "☁", theme: "weather-cloud" },
  { codes: [45, 48], description: "Fog", icon: "≋", theme: "weather-fog" },
  { codes: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], description: "Rain", icon: "☔", theme: "weather-rain" },
  { codes: [71, 73, 75, 77, 85, 86], description: "Snow", icon: "❄", theme: "weather-snow" },
  { codes: [95, 96, 99], description: "Thunderstorm", icon: "⚡", theme: "weather-storm" }
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
    empty.textContent = "No recent searches";
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
    description: "Unknown weather",
    icon: "?",
    theme: "weather-cloud"
  };
}

function applyTheme(theme) {
  document.body.classList.remove("weather-clear", "weather-cloud", "weather-rain", "weather-snow", "weather-storm", "weather-fog");
  document.body.classList.add(theme);
}

function formatTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));
}

async function fetchCityLocation(query) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("The city search service is temporarily unavailable. Please try again later.");
  }

  const data = await response.json();
  if (!data.results || !data.results.length) {
    throw new Error("City not found. Please check the spelling and try again.");
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
    throw new Error("The weather service is temporarily unavailable. Please try again later.");
  }

  const data = await response.json();
  if (!data.current) {
    throw new Error("Current weather data is unavailable. Please try another city.");
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
    setStatus("Please enter a city name.", "error");
    return;
  }

  setLoading(true);
  setStatus("Fetching weather data...");

  try {
    const location = await fetchCityLocation(query);
    const current = await fetchWeather(location);
    renderWeather(location, current);
    saveRecentCity(location.name);
    setStatus("Weather data updated.");
    cityInput.value = "";
  } catch (error) {
    setStatus(error.message || "Search failed. Please try again later.", "error");
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
